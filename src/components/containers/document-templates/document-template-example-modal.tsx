import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import { useDocumentTemplateExample } from './use-document-template-example';

interface DocumentTemplateExampleModalProps {
  content: string;
  onClose: () => void;
}

/** El mensaje como quedaría en un PDF, con datos de ejemplo en lugar de las variables. */
export const DocumentTemplateExampleModal: React.FC<DocumentTemplateExampleModalProps> = ({
  content,
  onClose,
}) => {
  const { t } = useTranslation();
  const { pdfUrl, isLoading, isError } = useDocumentTemplateExample(content);
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.TITLE)}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[92dvh] w-full max-w-3xl flex-col gap-3 rounded-t-card bg-white p-4 sm:rounded-card sm:p-5"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <Typography variant={TypographyVariant.ACCENT}>
          {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.TITLE)}
        </Typography>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-ink-50">
          {isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
              <Typography variant={TypographyVariant.BODY}>
                {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.LOADING)}
              </Typography>
            </div>
          )}
          {isError && (
            <div className="flex flex-col items-center gap-2 text-center">
              <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
              <Typography variant={TypographyVariant.BODY}>
                {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.ERROR)}
              </Typography>
            </div>
          )}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title={t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.FRAME_TITLE)}
              className="h-full w-full border-0"
            />
          )}
        </div>

        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={onClose}
          className="w-full sm:w-auto sm:self-end"
        >
          {t(TEXT.DOCUMENT_TEMPLATES.EXAMPLE.CLOSE)}
        </Button>
      </div>
    </div>
  );
};
