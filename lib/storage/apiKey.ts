/**
 * User Mistral API key (optional). When "use my key" is on, sent with AI requests.
 * Default: server uses MISTRAL_API_KEY from .env.
 */

export interface ApiKeySettings {
  useOwnKey: boolean;
  apiKey: string;
}

const STORAGE_KEY = "corporate_doc_apikey";

const defaultSettings: ApiKeySettings = {
  useOwnKey: false,
  apiKey: "",
};

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getApiKeySettings(): ApiKeySettings {
  if (!isClient()) return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<ApiKeySettings>;
    return {
      useOwnKey: Boolean(parsed.useOwnKey),
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
    };
  } catch {
    return defaultSettings;
  }
}

export function saveApiKeySettings(settings: ApiKeySettings): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save API key settings:", e);
  }
}

/** Body fragment for /api/outline and /api/draft when user has own key. */
export function getApiKeyBody(settings: ApiKeySettings): { apiKey?: string } {
  if (!settings.useOwnKey || !settings.apiKey?.trim()) return {};
  return { apiKey: settings.apiKey.trim() };
}
