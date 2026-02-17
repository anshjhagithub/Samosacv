/**
 * Mistral-only model: default from MISTRAL_API_KEY env or user's key from Settings.
 * SERVER-ONLY: This file must only be imported from API routes or server code.
 * MISTRAL_API_KEY must never be exposed to the client (do not use NEXT_PUBLIC_ prefix).
 */

import { createMistral, mistral } from "@ai-sdk/mistral";

const MISTRAL_MODEL = "mistral-large-latest";

export interface ModelOptions {
  apiKey?: string | null;
}

/**
 * Resolve API key: use request key if provided, else MISTRAL_API_KEY from env.
 */
export function resolveModelOptions(fromRequest: ModelOptions | null): { apiKey: string; useEnv: boolean } {
  if (fromRequest?.apiKey?.trim()) {
    return { apiKey: fromRequest.apiKey.trim(), useEnv: false };
  }
  const envKey = process.env.MISTRAL_API_KEY?.trim();
  if (envKey) {
    return { apiKey: envKey, useEnv: true };
  }
  throw new Error(
    "No Mistral API key. Set MISTRAL_API_KEY in .env and restart the dev server, or add your key in Settings."
  );
}

/**
 * Return the Mistral language model.
 */
export function getModel(resolved: { apiKey: string; useEnv: boolean }): unknown {
  if (resolved.useEnv) {
    return mistral(MISTRAL_MODEL) as never;
  }
  return createMistral({ apiKey: resolved.apiKey })(MISTRAL_MODEL) as never;
}
