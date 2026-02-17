import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Cashfree, CFEnvironment } from "cashfree-pg";

function getCashfreeClient() {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
  const env = process.env.CASHFREE_ENV?.toUpperCase();
  if (!appId || !secretKey) throw new Error("Cashfree not configured");
  const cfEnv = env === "PROD" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  return new Cashfree(cfEnv, appId, secretKey);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Supabase admin not configured");
  return createClient(url, key);
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-webhook-signature") ?? "";
  const timestamp = request.headers.get("x-webhook-timestamp") ?? "";
  const rawBody = await request.text();
  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature or timestamp" }, { status: 400 });
  }

  try {
    const cashfree = getCashfreeClient();
    cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
  } catch {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as {
    type?: string;
    data?: {
      order?: { order_id?: string };
      order_id?: string;
      cf_payment_id?: string;
      payment_status?: string;
      customer_id?: string;
    };
  };
  const eventType = payload.type ?? "";
  const orderId = payload.data?.order?.order_id ?? (payload.data as { order_id?: string })?.order_id ?? "";
  const paymentId = payload.data?.cf_payment_id ?? "";
  const paymentStatus = payload.data?.payment_status ?? "";
  const customerId = payload.data?.customer_id ?? "";

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const isSuccess = eventType.includes("PAYMENT_SUCCESS") || paymentStatus === "SUCCESS";

  if (isSuccess) {
    const userId = customerId || (orderId.startsWith("order_") ? orderId.split("_")[1] : null);
    if (!userId) {
      return NextResponse.json({ error: "Missing customer_id" }, { status: 400 });
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        cashfree_payment_id: paymentId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
    if (orderUpdateError) {
      console.error("Order update failed:", orderUpdateError);
    }

    const isRegenOrder = orderId.startsWith("regen_");
    if (isRegenOrder) {
      const parts = orderId.split("_");
      const uid = parts[1];
      const resumeId = parts[2];
      if (uid && resumeId) {
        await supabase.from("regeneration_history").insert({
          user_id: uid,
          resume_id: resumeId,
          order_id: orderId,
          amount_paise: 200,
        });
      }
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        subscription_status: "active",
        plan: "pro",
        cashfree_order_id: orderId,
        cashfree_payment_id: paymentId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }


  return NextResponse.json({ received: true }, { status: 200 });
}
