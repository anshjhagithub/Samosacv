import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { getLineItemsForOrder, getCartTotal } from "@/lib/cart";
import { FEATURE_PRICING, type FeatureSlug } from "@/lib/pricing";

const PREMIUM_PACK_AMOUNT = 49;

function getCashfreeClient() {
  const appId = process.env.CASHFREE_APP_ID?.trim();
  const secretKey = process.env.CASHFREE_SECRET_KEY?.trim();
  const env = process.env.CASHFREE_ENV?.toUpperCase();
  if (!appId || !secretKey) {
    throw new Error("CASHFREE_APP_ID and CASHFREE_SECRET_KEY are required");
  }
  const cfEnv = env === "PROD" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  return new Cashfree(cfEnv, appId, secretKey);
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Supabase admin not configured");
  return createAdminClient(url, key);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const isRegeneration = body.type === "regeneration" && body.resumeId;
    const isUpsell = body.type === "upsell" && body.amount === 12;
    const resumeId = typeof body.resumeId === "string" ? body.resumeId.trim() || null : null;
    const isToolkitCart = !isRegeneration && !isUpsell && (body.cart != null || body.line_items != null);

    let amount: number;
    let lineItems: Record<string, boolean>;
    let orderId: string;

    if (isRegeneration) {
      amount = FEATURE_PRICING.resume_regeneration;
      lineItems = { resume_regeneration: true };
      orderId = `regen_${user.id}_${body.resumeId}_${Date.now()}`;
    } else if (isUpsell) {
      amount = 12;
      lineItems = { mock_interview_live: true };
      orderId = `order_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    } else if (isToolkitCart) {
      const cart = body.cart ?? body.line_items ?? { resume_pdf: true };
      lineItems = typeof cart === "object" && !Array.isArray(cart)
        ? getLineItemsForOrder(cart as Partial<Record<FeatureSlug, boolean>>)
        : { resume_pdf: true };
      amount = getCartTotal(cart as Partial<Record<FeatureSlug, boolean>>);
      if (amount < FEATURE_PRICING.resume_pdf) {
        return NextResponse.json(
          { error: "Cart must include resume PDF (₹7 minimum)" },
          { status: 400 }
        );
      }
      orderId = `order_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    } else {
      amount = typeof body.amount === "number" ? body.amount : PREMIUM_PACK_AMOUNT;
      lineItems = { resume_pdf: true };
      orderId = `order_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }

    if (amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const amountPaise = Math.round(amount * 100);

    if (!isRegeneration) {
      const admin = getSupabaseAdmin();
      const { error: insertError } = await admin.from("orders").insert({
        order_id: orderId,
        user_id: user.id,
        resume_id: resumeId,
        line_items: lineItems,
        amount_paise: amountPaise,
        status: "pending",
      });
      if (insertError) {
        return NextResponse.json({ error: "Failed to create order record" }, { status: 500 });
      }
    }

    const cashfree = getCashfreeClient();
    const orderRequest = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: user.id,
        customer_email: user.email ?? "",
        customer_phone: (user.phone as string) ?? "",
      },
      order_meta: {
        return_url: `${baseUrl}/payment-status?order_id={order_id}`,
      },
    };

    const response = await cashfree.PGCreateOrder(orderRequest);
    const paymentSessionId = (response as { data?: { payment_session_id?: string } }).data?.payment_session_id;
    if (!paymentSessionId) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({
      order_id: orderId,
      payment_session_id: paymentSessionId,
      amount,
      line_items: lineItems,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Create order failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
