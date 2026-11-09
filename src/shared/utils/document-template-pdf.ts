import type { jsPDF } from 'jspdf';
import {
  BlockKind,
  parseBlocks,
  parseRuns,
  type Block,
  type TextRun,
} from '@/shared/utils/document-template-markdown';

/** Medidas de la hoja A4 en milímetros. */
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 20;
const FOOTER_HEIGHT_MM = 16;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_BOTTOM_MM = PAGE_HEIGHT_MM - MARGIN_MM - FOOTER_HEIGHT_MM;
const POINT_TO_MM = 0.3528;
const LINE_SPACING = 1.45;
const BLANK_LINE_RATIO = 0.6;
const HEADING_GAP_MM = 1.5;
const LIST_INDENT_MM = 6;
const LOGO_HEIGHT_MM = 8;
const LOGO_GAP_MM = 3;
const FOOTER_TOP_OFFSET_MM = 4;
const FOOTER_TEXT_OFFSET_MM = 2.5;
const RULE_WIDTH_MM = 0.2;
const STRIKE_HEIGHT_RATIO = 0.3;
const BODY_FONT_SIZE = 11;
const FOOTER_FONT_SIZE = 9;
const HEADING_FONT_SIZES = [20, 16, 13];
const TEXT_RGB: [number, number, number] = [39, 39, 42];
const MUTED_RGB: [number, number, number] = [113, 113, 122];
const RULE_RGB: [number, number, number] = [212, 212, 216];

interface TextPiece extends TextRun {
  width: number;
}

export interface DocumentLogo {
  dataUrl: string;
  /** Ancho / alto. */
  aspectRatio: number;
}

export interface DocumentTemplatePdfInput {
  content: string;
  clinicName: string;
  logo: DocumentLogo | null;
  /** Lo que se escribe al pie de cada hoja, p. ej. "1 de 3". */
  pageLabel: (page: number, total: number) => string;
}

const fontStyleOf = (run: TextRun) => {
  if (run.isBold && run.isItalic) return 'bolditalic';
  if (run.isBold) return 'bold';
  return run.isItalic ? 'italic' : 'normal';
};

/** Lee el logo (remoto o del sitio) como imagen; `null` si no carga (p. ej. por CORS). */
export function loadDocumentLogo(url: string): Promise<DocumentLogo | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context || !canvas.height) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          aspectRatio: canvas.width / canvas.height,
        });
      } catch {
        // Un canvas marcado por CORS no se puede leer.
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function drawLine(doc: jsPDF, pieces: TextPiece[], x: number, y: number, fontSize: number) {
  let cursor = x;
  pieces.forEach((piece) => {
    doc.setFont('helvetica', fontStyleOf(piece));
    doc.setFontSize(fontSize);
    doc.text(piece.text, cursor, y);
    if (piece.isStruck && piece.text.trim()) {
      const strikeY = y - fontSize * POINT_TO_MM * STRIKE_HEIGHT_RATIO;
      doc.setLineWidth(RULE_WIDTH_MM);
      doc.setDrawColor(...TEXT_RGB);
      doc.line(cursor, strikeY, cursor + piece.width, strikeY);
    }
    cursor += piece.width;
  });
}

function drawFooter(doc: jsPDF, input: DocumentTemplatePdfInput, page: number, total: number) {
  const footerTop = CONTENT_BOTTOM_MM + FOOTER_TOP_OFFSET_MM;
  const centerY = footerTop + (PAGE_HEIGHT_MM - MARGIN_MM - footerTop) / 2;
  doc.setDrawColor(...RULE_RGB);
  doc.setLineWidth(RULE_WIDTH_MM);
  doc.line(MARGIN_MM, footerTop, PAGE_WIDTH_MM - MARGIN_MM, footerTop);

  let x = MARGIN_MM;
  if (input.logo) {
    const logoWidth = LOGO_HEIGHT_MM * input.logo.aspectRatio;
    doc.addImage(
      input.logo.dataUrl,
      'PNG',
      x,
      centerY - LOGO_HEIGHT_MM / 2,
      logoWidth,
      LOGO_HEIGHT_MM,
    );
    x += logoWidth + LOGO_GAP_MM;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(FOOTER_FONT_SIZE);
  doc.setTextColor(...TEXT_RGB);
  doc.text(input.clinicName, x, centerY + FOOTER_TEXT_OFFSET_MM / 2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED_RGB);
  doc.text(
    input.pageLabel(page, total),
    PAGE_WIDTH_MM - MARGIN_MM,
    centerY + FOOTER_TEXT_OFFSET_MM / 2,
    {
      align: 'right',
    },
  );
}

/**
 * La plantilla ya con sus variables reemplazadas, como PDF A4: títulos, negrita,
 * cursiva, tachado y listas, con saltos de página y un pie (logo, clínica y
 * "n de N") en cada hoja. jsPDF se carga recién al generarlo.
 */
export async function buildDocumentTemplatePdf(input: DocumentTemplatePdfInput): Promise<Blob> {
  const { jsPDF: JsPdf } = await import('jspdf');
  const doc = new JsPdf({ unit: 'mm', format: 'a4' });
  let y = MARGIN_MM;

  const ensureSpace = (height: number) => {
    if (y + height <= CONTENT_BOTTOM_MM) return;
    doc.addPage();
    y = MARGIN_MM;
  };

  const writeBlock = (block: Block) => {
    if (block.kind === BlockKind.BLANK) {
      y += BODY_FONT_SIZE * POINT_TO_MM * LINE_SPACING * BLANK_LINE_RATIO;
      return;
    }
    const isHeading = block.kind === BlockKind.HEADING;
    const fontSize = isHeading ? HEADING_FONT_SIZES[(block.level ?? 1) - 1] : BODY_FONT_SIZE;
    const lineHeight = fontSize * POINT_TO_MM * LINE_SPACING;
    const indent = block.kind === BlockKind.LIST_ITEM ? LIST_INDENT_MM : 0;
    const maxWidth = CONTENT_WIDTH_MM - indent;

    const tokens: TextPiece[] = parseRuns(block.text, isHeading).flatMap((run) =>
      run.text
        .split(/(\s+)/)
        .filter(Boolean)
        .map((word) => {
          doc.setFont('helvetica', fontStyleOf(run));
          doc.setFontSize(fontSize);
          return { ...run, text: word, width: doc.getTextWidth(word) };
        }),
    );

    const lines: TextPiece[][] = [[]];
    let lineWidth = 0;
    tokens.forEach((token) => {
      const isSpace = !token.text.trim();
      const current = lines[lines.length - 1];
      if (!isSpace && lineWidth + token.width > maxWidth && current.length > 0) {
        lines.push([token]);
        lineWidth = token.width;
        return;
      }
      if (isSpace && current.length === 0) return;
      current.push(token);
      lineWidth += token.width;
    });

    if (isHeading) y += HEADING_GAP_MM;
    lines.forEach((line, lineIndex) => {
      ensureSpace(lineHeight);
      y += lineHeight;
      doc.setTextColor(...TEXT_RGB);
      if (lineIndex === 0 && block.marker) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        doc.text(block.marker, MARGIN_MM, y);
      }
      drawLine(doc, line, MARGIN_MM + indent, y, fontSize);
    });
    if (isHeading) y += HEADING_GAP_MM;
  };

  parseBlocks(input.content).forEach(writeBlock);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawFooter(doc, input, page, totalPages);
  }

  return doc.output('blob');
}
