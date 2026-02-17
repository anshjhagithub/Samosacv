/**
 * Document Type Registry — dynamic registration, no hardcoded document logic.
 * Add new document types by registering descriptors; core engine stays unchanged.
 */

import type {
  DocumentCategory,
  CorporateDocumentType,
  LegalDocumentType,
  FinanceDocumentType,
} from "@/types";
import type { DocumentRegistry as IRegistry, DocumentTypeDescriptor } from "./types";

const descriptors = new Map<string, DocumentTypeDescriptor>();

function getDescriptor(typeId: string): DocumentTypeDescriptor | undefined {
  return descriptors.get(typeId);
}

function getByCategory(category: DocumentCategory): DocumentTypeDescriptor[] {
  return Array.from(descriptors.values()).filter((d) => d.category === category);
}

function getAll(): DocumentTypeDescriptor[] {
  return Array.from(descriptors.values());
}

function register(descriptor: DocumentTypeDescriptor): void {
  descriptors.set(descriptor.id, descriptor);
}

// ─── Corporate ─────────────────────────────────────────────────────────────
const corporateTypes: DocumentTypeDescriptor[] = [
  { id: "prd", category: "corporate", label: "Product Requirements Document", description: "PRD", templateKey: "prd", requiresLegalLayer: false, requiresFinanceLayer: false, defaultSectionHints: ["Overview", "Goals", "Requirements", "Scope", "Timeline"] },
  { id: "brd", category: "corporate", label: "Business Requirements Document", description: "BRD", templateKey: "brd", requiresLegalLayer: false, requiresFinanceLayer: false },
  { id: "sow", category: "corporate", label: "Statement of Work", description: "SOW", templateKey: "sow", requiresLegalLayer: true, requiresFinanceLayer: true },
  { id: "rfp", category: "corporate", label: "Request for Proposal", description: "RFP", templateKey: "rfp", requiresLegalLayer: false, requiresFinanceLayer: false },
  { id: "rfq", category: "corporate", label: "Request for Quotation", description: "RFQ", templateKey: "rfq", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "board_report", category: "corporate", label: "Board Report", description: "Board Report", templateKey: "board_report", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "investor_update", category: "corporate", label: "Investor Update", description: "Investor Update", templateKey: "investor_update", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "business_plan", category: "corporate", label: "Business Plan", description: "Business Plan", templateKey: "business_plan", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "mou", category: "corporate", label: "Memorandum of Understanding", description: "MoU", templateKey: "mou", requiresLegalLayer: true, requiresFinanceLayer: false },
  { id: "nda", category: "corporate", label: "Non-Disclosure Agreement", description: "NDA", templateKey: "nda", requiresLegalLayer: true, requiresFinanceLayer: false },
  { id: "contract", category: "corporate", label: "Contract", description: "Contract", templateKey: "contract", requiresLegalLayer: true, requiresFinanceLayer: false },
];

// ─── Legal ─────────────────────────────────────────────────────────────────
const legalTypes: DocumentTypeDescriptor[] = [
  { id: "service_agreement", category: "legal", label: "Service Agreement", description: "Service Agreement", templateKey: "service_agreement", requiresLegalLayer: true, requiresFinanceLayer: false },
  { id: "employment_contract", category: "legal", label: "Employment Contract", description: "Employment Contract", templateKey: "employment_contract", requiresLegalLayer: true, requiresFinanceLayer: false },
  { id: "vendor_agreement", category: "legal", label: "Vendor Agreement", description: "Vendor Agreement", templateKey: "vendor_agreement", requiresLegalLayer: true, requiresFinanceLayer: false },
  { id: "partnership_agreement", category: "legal", label: "Partnership Agreement", description: "Partnership Agreement", templateKey: "partnership_agreement", requiresLegalLayer: true, requiresFinanceLayer: false },
  { id: "policy_document", category: "legal", label: "Policy Document", description: "Policy Document", templateKey: "policy_document", requiresLegalLayer: true, requiresFinanceLayer: false },
  { id: "compliance_declaration", category: "legal", label: "Compliance Declaration", description: "Compliance Declaration", templateKey: "compliance_declaration", requiresLegalLayer: true, requiresFinanceLayer: false },
];

// ─── Finance ───────────────────────────────────────────────────────────────
const financeTypes: DocumentTypeDescriptor[] = [
  { id: "budget_report", category: "finance", label: "Budget Report", description: "Budget Report", templateKey: "budget_report", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "financial_projection", category: "finance", label: "Financial Projection", description: "Financial Projection", templateKey: "financial_projection", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "investment_memo", category: "finance", label: "Investment Memo", description: "Investment Memo", templateKey: "investment_memo", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "audit_report", category: "finance", label: "Audit Report", description: "Audit Report", templateKey: "audit_report", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "due_diligence_report", category: "finance", label: "Due Diligence Report", description: "Due Diligence Report", templateKey: "due_diligence_report", requiresLegalLayer: false, requiresFinanceLayer: true },
  { id: "cost_analysis", category: "finance", label: "Cost Analysis", description: "Cost Analysis", templateKey: "cost_analysis", requiresLegalLayer: false, requiresFinanceLayer: true },
];

[corporateTypes, legalTypes, financeTypes].flat().forEach(register);

export const documentRegistry: IRegistry = {
  getDescriptor,
  getByCategory,
  getAll,
  register,
};

export type { DocumentTypeDescriptor, DocumentRegistry } from "./types";
