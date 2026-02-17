"use client";

import { useCallback, useState } from "react";
import type { ApiKeySettings as ApiKeySettingsType } from "@/lib/storage/apiKey";
import { getApiKeySettings, saveApiKeySettings } from "@/lib/storage/apiKey";

interface ApiKeySettingsProps {
  onClose: () => void;
  onSave?: () => void;
}

export function ApiKeySettings({ onClose, onSave }: ApiKeySettingsProps) {
  const [settings, setSettings] = useState<ApiKeySettingsType>(getApiKeySettings());

  const handleSave = useCallback(() => {
    saveApiKeySettings(settings);
    onSave?.();
    onClose();
  }, [settings, onSave, onClose]);

  return (
    <div className="rounded-lg bg-slate-800 border border-slate-600 p-4 space-y-4 max-w-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Mistral API key</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Default: uses server key from .env (MISTRAL_API_KEY). Or use your own Mistral API key below.
      </p>

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={settings.useOwnKey}
          onChange={(e) => setSettings((s) => ({ ...s, useOwnKey: e.target.checked }))}
          className="rounded border-slate-600 bg-slate-900 text-sky-500"
        />
        Use my Mistral API key
      </label>

      {settings.useOwnKey && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">Mistral API key</label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
            placeholder="Paste your Mistral API key"
            className="w-full rounded-md bg-slate-900 border border-slate-600 text-slate-200 px-3 py-2 text-sm placeholder-slate-500"
            autoComplete="off"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-md border border-slate-600 text-slate-300 text-sm hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-500"
        >
          Save
        </button>
      </div>
    </div>
  );
}
