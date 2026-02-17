/**
 * Client-side .docx export. No heavy server processing.
 * Architecture allows PDF extension later via alternate builder.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import type { DocumentDraft, DocumentMetadata } from "@/types";
import { getComplianceBlockText } from "@/engine/compliance";
import { getTemplateConfig } from "@/engine/templates";

function createComplianceParagraph(metadata: DocumentMetadata): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: getComplianceBlockText(metadata),
        size: 20, // 10pt
        color: "666666",
      }),
    ],
    spacing: { after: 400 },
  });
}

function contentToParagraphs(content: string): Paragraph[] {
  const lines = content.split(/\n+/).filter(Boolean);
  return lines.map(
    (line) =>
      new Paragraph({
        children: [new TextRun(line)],
        spacing: { after: 200 },
      })
  );
}

export function buildDocxDocument(
  draft: DocumentDraft,
  options: { includeComplianceBlock: boolean }
): Document {
  const children: (Paragraph | Table)[] = [];

  if (options.includeComplianceBlock) {
    children.push(createComplianceParagraph(draft.metadata));
  }

  const headingLevel = getTemplateConfig(draft.metadata.documentType).sectionHeadingLevel;
  const level =
    headingLevel === 1 ? HeadingLevel.HEADING_1 : headingLevel === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_1;

  for (const section of draft.sections.sort((a, b) => a.order - b.order)) {
    children.push(
      new Paragraph({
        text: section.title,
        heading: level,
        spacing: { before: 400, after: 200 },
      })
    );
    children.push(...contentToParagraphs(section.content));
  }

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

export async function exportDocx(
  draft: DocumentDraft,
  options: { includeComplianceBlock: boolean; fileName?: string }
): Promise<void> {
  const doc = buildDocxDocument(draft, { includeComplianceBlock: options.includeComplianceBlock });
  const blob = await Packer.toBlob(doc);
  const name = options.fileName ?? `${draft.metadata.documentId}.docx`;
  saveAs(blob, name);
}
