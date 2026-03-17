import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";

    const expectedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
      .update(body)
      .digest("base64");

    if (signature && signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    const orderId = data.data?.order?.order_id;
    const paymentStatus = data.data?.payment?.payment_status;

    console.log("Webhook received:", { orderId, paymentStatus, data: JSON.stringify(data, null, 2) });

    if (paymentStatus === "SUCCESS") {
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ 
          status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("order_id", orderId);

      if (updateError) {
        console.error("Failed to update order status:", updateError);
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }

      console.log("Order status updated successfully:", orderId);
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("order_id", orderId);

      if (updateError) {
        console.error("Failed to update order status to failed:", updateError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}