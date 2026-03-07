"use client";

export interface UnlockPdfModalProps {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  atsScore?: number;
}

export function UnlockPdfModal({ open, onClose, onUnlock, atsScore: rawScore }: UnlockPdfModalProps) {
  if (!open) return null;

  const atsScore = rawScore != null ? Math.min(100, rawScore) : null;
  const strengthLabel =
    atsScore != null
      ? atsScore >= 90
        ? "Strong"
        : atsScore >= 70
          ? "Good"
          : "Needs work"
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="unlock-modal-title" className="text-xl font-bold text-stone-900 mb-2">
          Your resume is ready
        </h2>
        <p className="text-stone-600 text-sm mb-4">
          Download clean PDF for <strong>₹15</strong>. Add ATS optimizer, mock interview prep, and more.
        </p>
        {atsScore != null && (
          <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-stone-50">
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider">ATS Score</span>
              <p className="text-2xl font-bold text-stone-900">{atsScore}</p>
            </div>
            {strengthLabel && (
              <div>
                <span className="text-xs text-stone-500 uppercase tracking-wider">Resume Strength</span>
                <p className="text-lg font-semibold text-amber-700">{strengthLabel}</p>
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-stone-500 mb-6">
          Resumes with ATS score below 90 are often rejected automatically. Unlock to download and improve further.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              onUnlock();
              onClose();
            }}
            className="flex-1 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Unlock Now
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-300 bg-transparent px-4 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
