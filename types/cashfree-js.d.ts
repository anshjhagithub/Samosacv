declare module "@cashfreepayments/cashfree-js" {
  export function load(params: { mode: "sandbox" | "production" }): Promise<{
    checkout?: (params: { paymentSessionId: string; returnUrl?: string }) => void;
  } | null>;
}
