"use client";

import { useCallback, useState } from "react";
import type { DocumentOutline, DocumentDraft, DocumentMetadata } from "@/types";
import { buildDocumentMetadata } from "@/engine/compliance";

interface DraftRunnerProps {
  outline: DocumentOutline;
  documentType: string;
  category: "corporate" | "legal" | "finance";
  apiKeyBody?: { apiKey?: string };
  onDraftReady: (draft: DocumentDraft) => void;
  onBack: () => void;
}

async function streamSectionContent(
  apiUrl: string,
  body: {
    documentType: string;
    section: { id: string; title: string; description: string };
    previousSectionSummaries: string[];
    entities?: Record<string, string>;
    apiKey?: string;
  },
  onChunk: (text: string) => void
): Promise<string> {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Draft request failed");
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");
  const decoder = new TextDecoder();
  let content = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    content += chunk;
    onChunk(chunk);
  }
  return content;
}

export function DraftRunner({
  outline,
  documentType,
  category,
  apiKeyBody = {},
  onDraftReady,
  onBack,
}: DraftRunnerProps) {
  const [sectionsDone, setSectionsDone] = useState<{ id: string; title: string; content: string; order: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sections = outline.sections;

  const runDraft = useCallback(async () => {
    if (sections.length === 0) {
      setError("No sections to draft.");
      return;
    }
    setError(null);
    setSectionsDone([]);
    setCurrentIndex(0);
    setIsLoading(true);

    const previousSummaries: string[] = [];
    const completed: { id: string; title: string; content: string; order: number }[] = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      setCurrentIndex(i);
      setStreamingContent("");
      try {
        const content = await streamSectionContent(
          "/api/draft",
          {
            documentType,
            section: {
              id: section.id,
              title: section.title,
              description: section.description,
            },
            previousSectionSummaries: [...previousSummaries],
            entities: outline.entities,
            ...apiKeyBody,
          },
          (chunk) => setStreamingContent((prev) => prev + chunk)
        );
        completed.push({
          id: section.id,
          title: section.title,
          content,
          order: i,
        });
        previousSummaries.push(`${section.title}: ${content.slice(0, 150)}...`);
        setSectionsDone([...completed]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Draft failed");
        setIsLoading(false);
        return;
      }
    }

    setStreamingContent("");
    setIsLoading(false);
    const metadata: DocumentMetadata = buildDocumentMetadata(
      category as "corporate" | "legal" | "finance",
      documentType as any,
      outline.riskFlags ?? []
    );
    onDraftReady({
      sections: completed,
      metadata,
    });
  }, [sections, documentType, category, outline.entities, outline.riskFlags, apiKeyBody, onDraftReady]);

  if (sections.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-slate-400">
        No sections in outline.{" "}
        <button type="button" onClick={onBack} className="text-sky-400 hover:underline">
          Go back
        </button>{" "}
        to add sections.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {sectionsDone.length === 0 && !isLoading && (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-slate-400">
            Ready to expand {sections.length} section(s) into a full draft.
          </p>
          <button
            type="button"
            onClick={runDraft}
            className="px-6 py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-500 transition-colors"
          >
            Start drafting
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-600/50 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {isLoading && sections[currentIndex] && (
        <div className="rounded-lg bg-slate-800/80 border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-2">
            Drafting: {sections[currentIndex].title} ({currentIndex + 1} / {sections.length})
          </p>
          <div className="text-slate-400 text-sm whitespace-pre-wrap min-h-[80px]">
            {streamingContent || "…"}
          </div>
        </div>
      )}

      {sectionsDone.length > 0 && !isLoading && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400">
            Completed: {sectionsDone.length} / {sections.length}
          </p>
          {sectionsDone.map((s) => (
            <div key={s.id} className="rounded bg-slate-800/50 border border-slate-600 p-2 text-sm">
              <span className="font-medium text-slate-300">{s.title}</span>
              <span className="text-slate-500 ml-2">✓</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Back to structure
        </button>
      </div>
    </div>
  );
}
