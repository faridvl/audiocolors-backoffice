import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalField } from '@/types/clinical-templates/clinical-template';
import { BackgroundChange } from './background-changes';
import { ClinicalHistoryFormValues, groupFields } from './clinical-history';

/** Medidas de la hoja A4 en milímetros. */
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const MARGIN_MM = 16;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2;
const COLUMN_GAP_MM = 8;
const COLUMN_WIDTH_MM = (CONTENT_WIDTH_MM - COLUMN_GAP_MM) / 2;

enum FontSize {
  TITLE = 16,
  SECTION = 12,
  BODY = 10,
  NOTE = 9,
}

const LINE_HEIGHT_MM = 5;
const SECTION_GAP_MM = 4;

/** Grises de la escala `ink` del sistema, para el texto apagado de los No. */
const MUTED_RGB: [number, number, number] = [148, 148, 148];
const TEXT_RGB: [number, number, number] = [23, 23, 23];

interface ClinicalHistoryPdfInput {
  t: TFunction;
  patientName: string;
  authorName: string;
  dateLabel: string;
  fields: ClinicalField[];
  values: ClinicalHistoryFormValues;
  changes: BackgroundChange[];
}

/**
 * La historia clínica editada como PDF: la hoja completa actualizada y, arriba,
 * lo que cambió respecto de la original. jsPDF se carga recién al generarlo.
 * Las fuentes estándar de PDF no tienen ✓ ni →: se escriben "Sí"/"No" y "antes/ahora".
 */
export async function buildClinicalHistoryPdf(input: ClinicalHistoryPdfInput): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { t, fields, values, changes } = input;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN_MM;

  const ensureSpace = (height: number) => {
    if (y + height <= PAGE_HEIGHT_MM - MARGIN_MM) return;
    doc.addPage();
    y = MARGIN_MM;
  };

  const write = (
    text: string,
    size: FontSize,
    options: { bold?: boolean; muted?: boolean } = {},
  ) => {
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...(options.muted ? MUTED_RGB : TEXT_RGB));
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH_MM) as string[];
    ensureSpace(lines.length * LINE_HEIGHT_MM);
    doc.text(lines, MARGIN_MM, y);
    y += lines.length * LINE_HEIGHT_MM;
  };

  write(t(TEXT.PATIENTS.BACKGROUND.PDF.TITLE), FontSize.TITLE, { bold: true });
  y += 2;
  write(t(TEXT.PATIENTS.BACKGROUND.PDF.PATIENT, { name: input.patientName }), FontSize.BODY);
  write(
    t(TEXT.PATIENTS.BACKGROUND.PDF.UPDATED_BY, {
      author: input.authorName,
      date: input.dateLabel,
    }),
    FontSize.BODY,
  );
  y += SECTION_GAP_MM;

  write(t(TEXT.PATIENTS.BACKGROUND.PDF.CHANGES_TITLE), FontSize.SECTION, {
    bold: true,
  });
  changes.forEach(({ label, before, after }) =>
    write(t(TEXT.PATIENTS.BACKGROUND.PDF.CHANGE_LINE, { label, before, after }), FontSize.BODY),
  );
  y += SECTION_GAP_MM;

  write(t(TEXT.PATIENTS.BACKGROUND.PDF.SHEET_TITLE), FontSize.SECTION, {
    bold: true,
  });
  groupFields(fields).forEach((group) => {
    y += 1;
    if (group.title) write(group.title, FontSize.BODY, { bold: true });

    // Sí/No en dos columnas, como la hoja en papel.
    group.booleans.forEach((field, index) => {
      const isChecked = Boolean(values.checks[field.id]);
      const column = index % 2;
      if (column === 0) ensureSpace(LINE_HEIGHT_MM);
      const x = MARGIN_MM + column * (COLUMN_WIDTH_MM + COLUMN_GAP_MM);
      doc.setFont('helvetica', isChecked ? 'bold' : 'normal');
      doc.setFontSize(FontSize.BODY);
      doc.setTextColor(...(isChecked ? TEXT_RGB : MUTED_RGB));
      doc.text(field.label, x, y);
      doc.text(t(isChecked ? TEXT.GENERAL.YES : TEXT.GENERAL.NO), x + COLUMN_WIDTH_MM, y, {
        align: 'right',
      });
      if (column === 1 || index === group.booleans.length - 1) y += LINE_HEIGHT_MM;
    });

    group.booleans
      .filter((field) => field.detailLabel && values.checks[field.id] && values.details[field.id])
      .forEach((field) =>
        write(`${field.detailLabel} ${values.details[field.id].trim()}`, FontSize.NOTE),
      );

    group.texts.forEach((field) => {
      const text = values.texts[field.id]?.trim();
      write(field.label, FontSize.NOTE, { muted: true });
      write(text || t(TEXT.GENERAL.NOT_REGISTERED), FontSize.BODY, {
        muted: !text,
      });
      y += 1;
    });
  });

  return doc.output('blob');
}
