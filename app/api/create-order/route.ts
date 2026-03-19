import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

const FEATURE_PRICING: Record<string, number> = {
  resume_pdf: 15,
  skill_roadmap: 4,
  linkedin_optimizer: 3,
  cover_letter: 5,
  interview_pack: 9,
  ats_improver: 5,
  ats_breakdown: 3,

};

function getCartTotal(cart: Record<string, boolean>) {
  let total = 0;

  for (const key in cart) {
    if (cart[key] && FEATURE_PRICING[key]) {
      total += FEATURE_PRICING[key];
    }
  }

  return total;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cart = body.cart || {};
    const userId = body.userId || "guest";
    const resumeId = body.resumeId || null;
    const mobileNumber = body.mobileNumber || null;
    const amount = body.amount || getCartTotal(cart);

    if (amount < FEATURE_PRICING.resume_pdf && !body.amount) {
      return NextResponse.json(
        { error: "Cart must include resume PDF" },
        { status: 400 }
      );
    }

    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const amountPaise = amount * 100;

    // Save order in Supabase
    const { error: dbError } = await supabaseAdmin.from("orders").insert({
      order_id: orderId,
      user_id: userId,
      resume_id: resumeId,
      line_items: cart,
      amount_paise: amountPaise,
      status: "pending",
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to create order record" },
        { status: 500 }
      );
    }

    // Use provided mobile number or generate dummy phone (Cashfree requires it)
    const phone = mobileNumber || "9" + Math.floor(100000000 + Math.random() * 900000000).toString();

    const cashfreeUrl =
      process.env.CASHFREE_ENV === "PROD"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    const cashfreeResponse = await fetch(cashfreeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_APP_ID!,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
      },
      body: JSON.stringify({
  order_id: orderId,
  order_amount: amount,
  order_currency: "INR",
  customer_details: {
    customer_id: userId,
    customer_email: "guest@samosacv.com",
    customer_phone: phone,
  },
  order_meta: {
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status?order_id={order_id}`
  }
}),
    });

    const data = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error("Cashfree error:", data);
      return NextResponse.json(
        { error: "Cashfree order creation failed", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: orderId,
      payment_session_id: data.payment_session_id,
    });
  } catch (err) {
    console.error("Server error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
