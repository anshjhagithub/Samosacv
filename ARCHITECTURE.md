# Architecture: Enterprise Document Operating System

## Overview

The system is a **reusable Document Engine**, not a single-document or single-template app. Core behavior is driven by a **document type registry**, **compliance engine**, and **template config**; adding new document categories or types does not require rewriting core logic.

## Layers

| Layer | Responsibility |
|-------|----------------|
| **UI** | Input → Structure → Draft → Export workflow; persistence triggers |
| **API** | `/api/outline` (structured JSON), `/api/draft` (streaming text per section) |
| **AI orchestration** | Prompts, Gemini via Vercel AI SDK, schema-validated outline |
| **Document engine** | Registry, compliance (ID, timestamp IST, blocks), templates, export |
| **State & resilience** | localStorage persistence, restore on refresh, graceful API failure handling |

## Document flow

1. **Input** — Raw content (paste / .txt / .docx), document type selection. Data persisted immediately.
2. **Structure** — AI returns validated outline (sections, optional travelContext, entities, riskFlags). User can add/remove/reorder sections, lock, edit descriptions.
3. **Draft** — User approves structure; each section is expanded via streaming AI; compliance metadata and layers applied.
4. **Export** — Client-side .docx build and download; compliance block optional. PDF can be added later (e.g. same content → PDF renderer).

## Compliance (mandatory)

- **Timestamp**: IST, format `DD MMM YYYY, HH:mm IST`.
- **Document ID**: `DOC-{CATEGORY}-{YYYYMMDD}-{RANDOM4}`.
- **Block**: Document ID, policy version, category, generated timestamp, risk flags (if any).
- **Legal layer** (when type has `requiresLegalLayer`): jurisdiction disclaimer, no binding legal advice, ambiguous clause flags.
- **Finance layer** (when type has `requiresFinanceLayer`): numbers in tables where applicable, default INR, assumptions section, unrealistic projection flags.

## Extensibility

- **New document type**: Register a `DocumentTypeDescriptor` in `engine/registry` (id, category, label, templateKey, requiresLegalLayer, requiresFinanceLayer, defaultSectionHints). No change to API or UI flow.
- **New category**: Add category to types, add descriptors to registry.
- **Templates**: `engine/templates` returns config per document type (heading level, tables for numbers, currency). Deeper template content (e.g. clause library) can be added without changing the engine interface.
- **Export**: `engine/export` exposes `exportDocx`; a second builder (e.g. `pdf.ts`) can consume the same `DocumentDraft` and metadata.

## Future-ready

- **Versioning**: Draft and outline can be versioned in state or backend.
- **Clause library**: Template system can resolve clause IDs to content.
- **Redlining**: Compare two drafts (e.g. previous version vs current).
- **Role-based editing**: Permissions can gate which sections are editable.
- **AI risk scoring**: Extra step after draft, writing into metadata.riskFlags or a dedicated field.
- **Knowledge base**: Include org-specific context in prompts (e.g. RAG or injected context).
