import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const cashfreeUrl =
      process.env.CASHFREE_ENV === "PROD"
        ? `https://api.cashfree.com/pg/orders/${orderId}`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const cashfreeResponse = await fetch(cashfreeUrl, {
      method: "GET",
      headers: {
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
      },
    });

    const data = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      return NextResponse.json(
        { error: "Failed to verify payment with Cashfree", details: data },
        { status: 500 }
      );
    }

    // Poll /payments as a fallback if order_status is still ACTIVE (lag)
    let isPaid = data.order_status === "PAID";
    
    if (!isPaid) {
      const paymentsResponse = await fetch(`${cashfreeUrl}/payments`, {
        headers: {
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.CASHFREE_APP_ID!,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
        },
      });
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        // Check if any payment attempt was successful
        if (Array.isArray(paymentsData) && paymentsData.some(p => p.payment_status === "SUCCESS")) {
          isPaid = true;
        }
      }
    }

    if (isPaid) {
      // Sync to database
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid"
        })
        .eq("order_id", orderId);

      if (updateError) {
        console.error("Failed to sync paid status to Supabase:", updateError);
        // Do not fail the request if it's a minor DB issue, but at least we log it
      }

      return NextResponse.json({ status: "PAID", verified: true });
    }

    return NextResponse.json({ status: data.order_status || "PENDING", verified: false });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
