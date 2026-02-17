"use client";

import { useCallback, useRef } from "react";
import type { UserInputState, InputSource, DocumentTypeId, DocumentCategory } from "@/types";
import { documentRegistry } from "@/engine/registry";

interface InputPhaseProps {
  input: UserInputState;
  onUpdate: (input: Partial<UserInputState>) => void;
  onGenerateOutline: () => void;
  isGenerating: boolean;
}

async function readFileAsText(file: File): Promise<string> {
  if (file.name.endsWith(".docx")) {
    const { extractRawText } = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await extractRawText({ arrayBuffer });
    return value;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function InputPhase({
  input,
  onUpdate,
  onGenerateOutline,
  isGenerating,
}: InputPhaseProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persist = useCallback(
    (next: Partial<UserInputState>) => {
      onUpdate({ ...next, lastSavedAt: new Date().toISOString() });
    },
    [onUpdate]
  );

  const handlePaste = useCallback(() => {
    persist({ source: "paste" });
  }, [persist]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const isDocx = file.name.endsWith(".docx");
      const isTxt = file.name.endsWith(".txt");
      if (!isDocx && !isTxt) {
        alert("Please upload a .txt or .docx file.");
        return;
      }
      try {
        const text = await readFileAsText(file);
        persist({
          rawContent: text,
          source: isDocx ? "upload_docx" : "upload_txt",
          fileName: file.name,
        });
      } catch (err) {
        console.error(err);
        alert("Failed to read file.");
      }
      e.target.value = "";
    },
    [persist]
  );

  const categories: DocumentCategory[] = ["corporate", "legal", "finance"];
  const typesByCategory = categories.map((cat) => ({
    category: cat,
    types: documentRegistry.getByCategory(cat),
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Document type</label>
        <div className="flex flex-wrap gap-2">
          {typesByCategory.map(({ category, types }) => (
            <div key={category} className="flex flex-wrap gap-1">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => persist({ documentType: t.id as DocumentTypeId, category: t.category })}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    input.documentType === t.id
                      ? "bg-sky-600 border-sky-500 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">Input</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              Upload .txt / .docx
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <textarea
          value={input.rawContent}
          onChange={(e) => persist({ rawContent: e.target.value })}
          onBlur={() => persist({})}
          onFocus={handlePaste}
          placeholder="Paste transcript, write raw notes, or upload a file..."
          className="w-full min-h-[280px] rounded-lg bg-slate-900 border border-slate-600 text-slate-100 placeholder-slate-500 p-4 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
          rows={12}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGenerateOutline}
          disabled={!input.rawContent.trim() || isGenerating}
          className="px-6 py-2.5 rounded-lg bg-sky-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors"
        >
          {isGenerating ? "Generating outline…" : "Generate outline"}
        </button>
      </div>
    </div>
  );
}
