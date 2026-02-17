import type {
  DocumentCategory,
  DocumentTypeId,
} from "@/types";

/**
 * Registry entry for a document type. Enables dynamic registration
 * and template-driven behavior without hardcoding.
 */
export interface DocumentTypeDescriptor {
  id: DocumentTypeId;
  category: DocumentCategory;
  label: string;
  description: string;
  /** Template key for drafting (e.g. "prd", "nda") */
  templateKey: string;
  /** Whether this type requires legal safety layer */
  requiresLegalLayer: boolean;
  /** Whether this type requires finance intelligence layer */
  requiresFinanceLayer: boolean;
  /** Default section hints for outline generation */
  defaultSectionHints?: string[];
}

export interface DocumentRegistry {
  getDescriptor(typeId: DocumentTypeId): DocumentTypeDescriptor | undefined;
  getByCategory(category: DocumentCategory): DocumentTypeDescriptor[];
  getAll(): DocumentTypeDescriptor[];
  register(descriptor: DocumentTypeDescriptor): void;
}
