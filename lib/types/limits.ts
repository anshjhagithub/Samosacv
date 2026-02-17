/** User limits from get-limits edge function (backend is source of truth). */
export interface UserLimitsData {
  free_generations_used: number;
  free_generations_remaining: number;
  free_limit: number;
  premium_generations_remaining: number;
  premium_unlocked: boolean;
  wallet_balance_paise: number;
  wallet_balance_rupees: string;
}

/** 402 response code from generate_resume – which modal to show. */
export type PaymentRequiredCode =
  | "FREE_LIMIT_REACHED"
  | "PREMIUM_LOCKED"
  | "INSUFFICIENT_FUNDS";
