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

    // Cashfree returns order_status. Let's check if it's PAID
    if (data.order_status === "PAID") {
      // Sync to database
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (updateError) {
        console.error("Failed to sync paid status to Supabase:", updateError);
      }

      return NextResponse.json({ status: "PAID", verified: true });
    }

    return NextResponse.json({ status: data.order_status || "PENDING", verified: false });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
