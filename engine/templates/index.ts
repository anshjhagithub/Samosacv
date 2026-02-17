/**
 * Template system for document-type-specific formatting and rules.
 * Used by drafting and export; extensible without changing core engine.
 */

import type { DocumentTypeId } from "@/types";
import { documentRegistry } from "@/engine/registry";

export interface TemplateConfig {
  /** Heading style for section titles */
  sectionHeadingLevel: number;
  /** Whether to force tables for numeric content (finance) */
  useTablesForNumbers: boolean;
  /** Default currency for numbers */
  defaultCurrency: string;
  /** Intro paragraph template (optional) */
  introTemplate?: (docId: string, generatedAt: string) => string;
}

const defaultConfig: TemplateConfig = {
  sectionHeadingLevel: 1,
  useTablesForNumbers: false,
  defaultCurrency: "INR",
};

const templateConfigs: Partial<Record<DocumentTypeId, Partial<TemplateConfig>>> = {
  budget_report: { useTablesForNumbers: true, defaultCurrency: "INR" },
  financial_projection: { useTablesForNumbers: true, defaultCurrency: "INR" },
  investment_memo: { useTablesForNumbers: true, defaultCurrency: "INR" },
  audit_report: { useTablesForNumbers: true, defaultCurrency: "INR" },
  due_diligence_report: { useTablesForNumbers: true, defaultCurrency: "INR" },
  cost_analysis: { useTablesForNumbers: true, defaultCurrency: "INR" },
  nda: { sectionHeadingLevel: 1 },
  contract: { sectionHeadingLevel: 1 },
  service_agreement: { sectionHeadingLevel: 1 },
};

export function getTemplateConfig(documentType: DocumentTypeId): TemplateConfig {
  const overrides = templateConfigs[documentType] ?? {};
  return { ...defaultConfig, ...overrides };
}

export function getSectionHeadingLevel(documentType: DocumentTypeId): number {
  return getTemplateConfig(documentType).sectionHeadingLevel;
}

export function shouldUseTablesForNumbers(documentType: DocumentTypeId): boolean {
  return getTemplateConfig(documentType).useTablesForNumbers;
}
