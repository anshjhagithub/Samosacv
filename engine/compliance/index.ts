/**
 * Enterprise Compliance Engine
 * - Timestamp Rule (IST, DD MMM YYYY, HH:mm IST)
 * - Document ID: DOC-{CATEGORY}-{YYYYMMDD}-{RANDOM4}
 * - Compliance block for all documents
 * - Legal safety layer / Finance intelligence layer
 */

import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { DocumentCategory, DocumentMetadata, DocumentTypeId } from "@/types";
import { documentRegistry } from "@/engine/registry";

const IST = "Asia/Kolkata";

/** Format timestamp per enterprise rule: DD MMM YYYY, HH:mm IST */
export function formatTimestampIST(date: Date = new Date()): string {
  return formatInTimeZone(date, IST, "dd MMM yyyy, HH:mm zzz");
}

/** Generate document ID: DOC-{CATEGORY}-{YYYYMMDD}-{RANDOM4} */
export function generateDocumentId(category: DocumentCategory): string {
  const now = toZonedTime(new Date(), IST);
  const datePart = format(now, "yyyyMMdd");
  const random4 = uuidv4().slice(0, 4);
  return `DOC-${category.toUpperCase()}-${datePart}-${random4}`;
}

/** Build full compliance metadata for a document */
export function buildDocumentMetadata(
  category: DocumentCategory,
  documentType: DocumentTypeId,
  riskFlags: string[] = [],
  options?: {
    jurisdictionDisclaimer?: string;
    legalAdviceDisclaimer?: string;
    ambiguousClauses?: string[];
    currency?: string;
    assumptionsSection?: string;
    unrealisticProjectionFlags?: string[];
  }
): DocumentMetadata {
  const descriptor = documentRegistry.getDescriptor(documentType);
  const policyVersion = "1.0"; // Can be driven by config/DB later

  const metadata: DocumentMetadata = {
    documentId: generateDocumentId(category),
    policyVersion,
    category,
    documentType,
    generatedAt: formatTimestampIST(),
    riskFlags: riskFlags ?? [],
  };

  if (descriptor?.requiresLegalLayer && options) {
    metadata.jurisdictionDisclaimer =
      options.jurisdictionDisclaimer ??
      "This document is subject to the laws of the jurisdiction specified herein. It does not constitute binding legal advice.";
    metadata.legalAdviceDisclaimer =
      options.legalAdviceDisclaimer ??
      "For binding legal advice, please consult a qualified legal professional.";
    if (options.ambiguousClauses?.length) metadata.ambiguousClauses = options.ambiguousClauses;
  }

  if (descriptor?.requiresFinanceLayer && options) {
    metadata.currency = options.currency ?? "INR";
    if (options.assumptionsSection) metadata.assumptionsSection = options.assumptionsSection;
    if (options.unrealisticProjectionFlags?.length)
      metadata.unrealisticProjectionFlags = options.unrealisticProjectionFlags;
  }

  return metadata;
}

/** Compliance block text for insertion at top of document */
export function getComplianceBlockText(metadata: DocumentMetadata): string {
  const lines: string[] = [
    `Document ID: ${metadata.documentId}`,
    `Policy Version: ${metadata.policyVersion}`,
    `Category: ${metadata.category}`,
    `Generated: ${metadata.generatedAt}`,
  ];
  if (metadata.riskFlags.length > 0) {
    lines.push(`Risk Flags: ${metadata.riskFlags.join("; ")}`);
  }
  return lines.join(" | ");
}
