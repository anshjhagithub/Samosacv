/**
 * Mistral-only model: default from MISTRAL_API_KEY env or user's key from Settings.
 * SERVER-ONLY: This file must only be imported from API routes or server code.
 * MISTRAL_API_KEY must never be exposed to the client (do not use NEXT_PUBLIC_ prefix).
 *
 * Model: set MISTRAL_MODEL in .env to upgrade. Examples:
 *   mistral-small-latest   — faster, cheaper
 *   mistral-medium-latest  — balance
 *   mistral-large-latest   — default, best quality
 *   mistral-large-2        — newer flagship (if available on your plan)
 * See https://docs.mistral.ai/guides/model-selection/
 */

import { createMistral, mistral } from "@ai-sdk/mistral";

const DEFAULT_MODEL = "mistral-small-2506";

/** Model ID used for all Mistral calls. Override with MISTRAL_MODEL in .env. */
function getModelId(): string {
  const env = process.env.MISTRAL_MODEL?.trim();
  return env || DEFAULT_MODEL;
}

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
  const modelId = getModelId();
  if (resolved.useEnv) {
    return mistral(modelId) as never;
  }
  return createMistral({ apiKey: resolved.apiKey })(modelId) as never;
}
