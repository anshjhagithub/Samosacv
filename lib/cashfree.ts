/**
 * Client-side: load Cashfree.js and open checkout with payment_session_id.
 */

export async function openCashfreeCheckout(
  paymentSessionId: string,
  _returnUrl?: string
): Promise<void> {
  const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === "PROD" ? "production" : "sandbox";
  const { load } = await import("@cashfreepayments/cashfree-js");
  const cashfree = await load({ mode });
  const cf = cashfree as { checkout?: (p: { paymentSessionId: string }) => void };
  if (cf?.checkout) {
    cf.checkout({ paymentSessionId });
    return;
  }
  const base =
    mode === "production"
      ? "https://payments.cashfree.com"
      : "https://payments-test.cashfree.com";
  window.location.href = `${base}/checkout?payment_session_id=${encodeURIComponent(paymentSessionId)}`;
}
