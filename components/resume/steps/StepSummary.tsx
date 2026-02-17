"use client";

import { ImproveButton } from "../ImproveButton";

export function StepSummary({
  summary,
  onChange,
  onImprove,
}: {
  summary: string;
  onChange: (s: string) => void;
  onImprove?: (current: string) => Promise<string>;
}) {
  return (
    <div className="space-y-5 max-w-xl">
      <p className="text-slate-600">
        Optional. 2–4 sentences that highlight your experience and goals. Use AI to improve it.
      </p>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-slate-700">Professional summary</label>
          {onImprove && (
            <ImproveButton
              label="Improve with AI"
              onClick={async () => {
                const next = await onImprove(summary || "Experienced professional.");
                if (next) onChange(next);
              }}
            />
          )}
        </div>
        <textarea
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Software engineer with 5+ years building scalable web applications."
          rows={5}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>
    </div>
  );
}
