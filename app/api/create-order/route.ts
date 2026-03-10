import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FEATURE_PRICING: Record<string, number> = {
  resume_pdf: 7,
  skill_roadmap: 4,
  linkedin_optimizer: 3,
  cover_letter: 5,
  interview_pack: 9,
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

    const amount = getCartTotal(cart);

    if (amount < FEATURE_PRICING.resume_pdf) {
      return NextResponse.json(
        { error: "Cart must include resume PDF" },
        { status: 400 }
      );
    }

    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const amountPaise = amount * 100;

    const { error } = await supabaseAdmin.from("orders").insert({
      order_id: orderId,
      user_id: userId,
      resume_id: resumeId,
      line_items: cart,
      amount_paise: amountPaise,
      status: "pending",
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to create order record" },
        { status: 500 }
      );
    }

    const cashfreeResponse = await fetch(
      `${process.env.CASHFREE_ENV === "PROD"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders"
      }`,
      {
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
          },
        }),
      }
    );

    const data = await cashfreeResponse.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}