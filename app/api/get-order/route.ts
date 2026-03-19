import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check if user has valid payment for this resume
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resume_id");
    
    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID required" },
        { status: 400 }
      );
    }

    // Get order details from database
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("resume_id", resumeId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Order not found or payment not completed" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: "Failed to get order" },
      { status: 500 }
    );
  }
}
