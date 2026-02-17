/**
 * Enterprise Document Operating System — Core Type Definitions
 * All document flows and engine logic use these types.
 */

// ─── Document Categories (extensible) ───────────────────────────────────────
export type DocumentCategory = "corporate" | "legal" | "finance";

export type CorporateDocumentType =
  | "prd"
  | "brd"
  | "sow"
  | "rfp"
  | "rfq"
  | "board_report"
  | "investor_update"
  | "business_plan"
  | "mou"
  | "nda"
  | "contract";

export type LegalDocumentType =
  | "service_agreement"
  | "employment_contract"
  | "vendor_agreement"
  | "partnership_agreement"
  | "policy_document"
  | "compliance_declaration";

export type FinanceDocumentType =
  | "budget_report"
  | "financial_projection"
  | "investment_memo"
  | "audit_report"
  | "due_diligence_report"
  | "cost_analysis";

export type DocumentTypeId =
  | CorporateDocumentType
  | LegalDocumentType
  | FinanceDocumentType;

// ─── Travel context (branching) ────────────────────────────────────────────
export type TravelContextType = "HOTEL" | "FLIGHT" | "COMBINED" | "NONE";

// ─── Outline & structure ───────────────────────────────────────────────────
export interface OutlineSection {
  id: string;
  title: string;
  description: string;
  locked?: boolean;
  order: number;
  /** For travel: subsections when context is HOTEL/FLIGHT/COMBINED */
  subsections?: OutlineSection[];
  /** Custom compliance block identifier */
  complianceBlockId?: string;
}

export interface DocumentOutline {
  sections: OutlineSection[];
  travelContext?: TravelContextType;
  /** Entity hints for drafting */
  entities?: Record<string, string>;
  /** Risk flags from AI */
  riskFlags?: string[];
}

// ─── Draft (expanded document) ─────────────────────────────────────────────
export interface DraftSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface DocumentDraft {
  sections: DraftSection[];
  metadata: DocumentMetadata;
}

// ─── Compliance metadata (mandatory for all documents) ──────────────────────
export interface DocumentMetadata {
  documentId: string;
  policyVersion: string;
  category: DocumentCategory;
  documentType: DocumentTypeId;
  generatedAt: string; // IST format: "DD MMM YYYY, HH:mm IST"
  riskFlags: string[];
  /** Legal-only */
  jurisdictionDisclaimer?: string;
  legalAdviceDisclaimer?: string;
  ambiguousClauses?: string[];
  /** Finance-only */
  currency?: string;
  assumptionsSection?: string;
  unrealisticProjectionFlags?: string[];
}

// ─── User input phase ───────────────────────────────────────────────────────
export type InputSource = "paste" | "upload_txt" | "upload_docx" | "notes";

export interface UserInputState {
  rawContent: string;
  source: InputSource;
  fileName?: string;
  documentType: DocumentTypeId;
  category: DocumentCategory;
  lastSavedAt: string; // ISO
}

// ─── Full workflow state (persisted) ─────────────────────────────────────────
export type WorkflowStep = "input" | "structure" | "draft" | "export";

export interface DocumentWorkflowState {
  step: WorkflowStep;
  input: UserInputState;
  outline: DocumentOutline | null;
  draft: DocumentDraft | null;
  version: number;
  updatedAt: string;
}

// ─── Export ─────────────────────────────────────────────────────────────────
export type ExportFormat = "docx"; // | "pdf" later

export interface ExportOptions {
  format: ExportFormat;
  includeComplianceBlock: boolean;
}
