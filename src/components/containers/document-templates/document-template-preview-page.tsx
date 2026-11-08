import React from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useTranslation } from "react-i18next";
import { TEXT } from "@/static/texts/i18n";
import { PdfPageSize } from "./use-document-template-preview";
import { usePdfPageCanvas } from "./use-pdf-page-canvas";

interface DocumentTemplatePreviewPageProps {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  pageSize: PdfPageSize;
}

/** Una hoja del PDF. Antes de dibujarse el canvas ya tiene la proporción de la hoja, para que la altura no salte. */
export const DocumentTemplatePreviewPage: React.FC<
  DocumentTemplatePreviewPageProps
> = ({ pdfDocument, pageNumber, pageSize }) => {
  const { t } = useTranslation();
  const { canvasRef } = usePdfPageCanvas({ pdfDocument, pageNumber });

  return (
    <canvas
      ref={canvasRef}
      width={Math.round(pageSize.width)}
      height={Math.round(pageSize.height)}
      role="img"
      aria-label={t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.PAGE_ARIA, {
        page: pageNumber,
        total: pdfDocument.numPages,
      })}
      className="h-auto w-[720px] max-w-none shrink-0 rounded-lg bg-white shadow-sm sm:w-full sm:max-w-3xl"
    />
  );
};
