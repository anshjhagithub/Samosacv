import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Use the correct environment variables for Supabase admin access
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
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
      console.error("Invalid webhook signature");
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
      try {
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({ 
            status: "paid"
          })
          .eq("order_id", orderId);

        if (updateError) {
          console.error("Failed to update order status:", updateError);
          // Don't return error immediately, continue to log the issue
        } else {
          console.log("Order status updated successfully:", orderId);
        }
      } catch (dbError) {
        console.error("Database error updating order:", dbError);
      }
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      try {
        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({ 
            status: "failed"
          })
          .eq("order_id", orderId);

        if (updateError) {
          console.error("Failed to update order status to failed:", updateError);
        } else {
          console.log("Order status updated to failed:", orderId);
        }
      } catch (dbError) {
        console.error("Database error updating order to failed:", dbError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    
    return NextResponse.json(
      { error: "Webhook error", details: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}