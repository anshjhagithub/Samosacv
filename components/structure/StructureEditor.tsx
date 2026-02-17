"use client";

import { useCallback, useState } from "react";
import type { DocumentOutline, OutlineSection } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface StructureEditorProps {
  outline: DocumentOutline;
  onUpdate: (outline: DocumentOutline) => void;
  onApprove: () => void;
  onBack: () => void;
}

function SectionRow({
  section,
  onEdit,
  onRemove,
  onLock,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  section: OutlineSection;
  onEdit: (s: OutlineSection) => void;
  onRemove: (s: OutlineSection) => void;
  onLock: (s: OutlineSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [description, setDescription] = useState(section.description);

  const saveEdit = useCallback(() => {
    onEdit({ ...section, title, description });
    setEditing(false);
  }, [section, title, description, onEdit]);

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/80 border border-slate-600">
      <div className="flex flex-col gap-1">
        <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="text-slate-400 hover:text-white disabled:opacity-30 p-0.5">
          ↑
        </button>
        <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="text-slate-400 hover:text-white disabled:opacity-30 p-0.5">
          ↓
        </button>
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-1 rounded px-2 py-1 bg-slate-900 border border-slate-600 text-slate-100"
              placeholder="Section title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded px-2 py-1 bg-slate-900 border border-slate-600 text-slate-100 text-sm min-h-[60px]"
              placeholder="Description"
            />
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={saveEdit} className="text-sm text-sky-400 hover:text-sky-300">Save</button>
              <button type="button" onClick={() => { setTitle(section.title); setDescription(section.description); setEditing(false); }} className="text-sm text-slate-400">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-100">{section.title}</span>
              {section.locked && <span className="text-xs text-amber-400">Locked</span>}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{section.description}</p>
            <div className="mt-1 flex gap-2">
              <button type="button" onClick={() => setEditing(true)} className="text-sm text-sky-400 hover:text-sky-300">Edit</button>
              <button type="button" onClick={() => onLock(section)} className="text-sm text-slate-400 hover:text-slate-300">
                {section.locked ? "Unlock" : "Lock"}
              </button>
              <button type="button" onClick={() => onRemove(section)} className="text-sm text-red-400 hover:text-red-300">Remove</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function StructureEditor({ outline, onUpdate, onApprove, onBack }: StructureEditorProps) {
  const sections = outline.sections;

  const updateSections = useCallback(
    (next: OutlineSection[]) => {
      const ordered = next.map((s, i) => ({ ...s, order: i }));
      onUpdate({ ...outline, sections: ordered });
    },
    [outline, onUpdate]
  );

  const handleEdit = useCallback(
    (updated: OutlineSection) => {
      updateSections(
        sections.map((s) => (s.id === updated.id ? { ...updated, order: s.order } : s))
      );
    },
    [sections, updateSections]
  );

  const handleRemove = useCallback(
    (section: OutlineSection) => {
      updateSections(sections.filter((s) => s.id !== section.id));
    },
    [sections, updateSections]
  );

  const handleLock = useCallback(
    (section: OutlineSection) => {
      updateSections(
        sections.map((s) => (s.id === section.id ? { ...s, locked: !s.locked } : s))
      );
    },
    [sections, updateSections]
  );

  const move = useCallback(
    (index: number, delta: number) => {
      const next = [...sections];
      const target = index + delta;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      updateSections(next);
    },
    [sections, updateSections]
  );

  const addSection = useCallback(() => {
    const newSection: OutlineSection = {
      id: `sec_${uuidv4().slice(0, 8)}`,
      title: "New section",
      description: "",
      order: sections.length,
    };
    updateSections([...sections, newSection]);
  }, [sections, updateSections]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {outline.riskFlags && outline.riskFlags.length > 0 && (
        <div className="rounded-lg bg-amber-900/30 border border-amber-600/50 p-3">
          <span className="text-sm font-medium text-amber-400">Risk flags:</span>
          <ul className="text-sm text-amber-200/90 mt-1 list-disc list-inside">
            {outline.riskFlags.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Structure</h2>
        <button
          type="button"
          onClick={addSection}
          className="text-sm text-sky-400 hover:text-sky-300"
        >
          + Add section
        </button>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <SectionRow
            key={section.id}
            section={section}
            onEdit={handleEdit}
            onRemove={handleRemove}
            onLock={handleLock}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
            canMoveUp={index > 0}
            canMoveDown={index < sections.length - 1}
          />
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="px-6 py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-500 transition-colors"
        >
          Approve & draft
        </button>
      </div>
    </div>
  );
}
