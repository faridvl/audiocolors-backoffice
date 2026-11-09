import React, { useEffect } from "react";
import { AlertTriangle, ArrowLeft, Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, ButtonVariant } from "@/components/common/button/button";
import {
  Typography,
  TypographyVariant,
} from "@/components/common/typography/typography";
import { TEXT } from "@/static/texts/i18n";
import { DocumentTemplatePreviewPage } from "./document-template-preview-page";
import { useDocumentTemplatePreview } from "./use-document-template-preview";

export const PREVIEW_BACK_BUTTON_ID = "document-template-preview-back";

interface DocumentTemplatePreviewProps {
  content: string;
  templateName: string;
  onBack: () => void;
}

/** El mensaje como quedaría en un PDF, con datos de ejemplo en lugar de las variables, dentro de la página. */
export const DocumentTemplatePreview: React.FC<
  DocumentTemplatePreviewProps
> = ({ content, templateName, onBack }) => {
  const { t } = useTranslation();
  const {
    pdfDocument,
    pageSizes,
    isLoading,
    isError,
    canDownload,
    handleRetry,
    handleDownload,
  } = useDocumentTemplatePreview(content, templateName);

  useEffect(() => {
    document.getElementById(PREVIEW_BACK_BUTTON_ID)?.focus();
  }, []);

  return (
    <div className="flex w-full flex-col">
      <div className="sticky -top-5 z-10 flex items-center gap-2 bg-white py-3">
        <Button
          id={PREVIEW_BACK_BUTTON_ID}
          variant={ButtonVariant.GHOST}
          onClick={onBack}
          icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
          className="shrink-0 px-2 sm:px-4"
        >
          {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.BACK_TO_EDIT)}
        </Button>
        <Typography
          variant={TypographyVariant.ACCENT}
          className="hidden min-w-0 flex-1 truncate sm:block"
        >
          {templateName.trim() || t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.UNNAMED)}
        </Typography>
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={handleDownload}
          disabled={!canDownload}
          icon={<Download className="h-4 w-4" aria-hidden />}
          className="ml-auto shrink-0 px-3 sm:ml-0 sm:px-4"
        >
          {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.DOWNLOAD)}
        </Button>
      </div>

      {isLoading && (
        <div
          role="status"
          className="mt-4 flex min-h-[60vh] items-center justify-center gap-2 rounded-card bg-ink-50"
        >
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.LOADING)}
          </Typography>
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="mt-4 flex min-h-[60vh] flex-col items-center justify-center gap-2 rounded-card bg-ink-50 text-center"
        >
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.ERROR)}
          </Typography>
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={handleRetry}
            className="mt-2"
          >
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}

      {pdfDocument && (
        <div className="mt-4 flex flex-col items-start gap-4 overflow-x-auto rounded-card bg-ink-50 px-2 py-4 sm:items-center lg:px-6 lg:py-6">
          {pageSizes.map((pageSize, index) => (
            <DocumentTemplatePreviewPage
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              pdfDocument={pdfDocument}
              pageNumber={index + 1}
              pageSize={pageSize}
            />
          ))}
        </div>
      )}
    </div>
  );
};
