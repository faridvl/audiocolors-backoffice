import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';

interface ConfirmDeleteModalProps {
  fileName: string | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  fileName,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!fileName) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-card bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle className="h-5 w-5 text-danger" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.DOCUMENTS.DELETE.TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              <Trans
                t={t}
                i18nKey={TEXT.DOCUMENTS.DELETE.MESSAGE}
                values={{ name: fileName }}
                components={{ strong: <span className="font-medium text-ink-800" /> }}
              />
            </Typography>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isDeleting}>
            {t(TEXT.GENERAL.BUTTONS.CANCEL)}
          </Button>
          <Button variant={ButtonVariant.DANGER} onClick={onConfirm} isLoading={isDeleting}>
            {t(TEXT.DOCUMENTS.DELETE.CONFIRM)}
          </Button>
        </div>
      </div>
    </div>
  );
};
