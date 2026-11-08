import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { INVALIDATION_REASON_MAX_LENGTH } from '@/types/patients/audiometry-entry';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

const INVALIDATE_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.INVALIDATE;
const REASON_ROWS = 4;

interface InvalidateAudiometryModalProps {
  isLoading: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/** Pide el motivo antes de marcar una audiometría como mal hecha; el aviso deja claro que no se deshace. */
export const InvalidateAudiometryModal: React.FC<InvalidateAudiometryModalProps> = ({
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  useEscapeKey(onCancel);

  const trimmedReason = reason.trim();
  const canConfirm = trimmedReason.length > 0 && !isLoading;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(INVALIDATE_TEXT.TITLE)}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[100dvh] w-full max-w-md flex-col overflow-y-auto rounded-t-card bg-white p-5 sm:rounded-card"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>{t(INVALIDATE_TEXT.TITLE)}</Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {t(INVALIDATE_TEXT.WARNING)}
            </Typography>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <label
            htmlFor="invalidate-audiometry-reason"
            className="text-sm font-medium text-ink-700"
          >
            {t(INVALIDATE_TEXT.REASON_LABEL)}
          </label>
          <textarea
            id="invalidate-audiometry-reason"
            value={reason}
            rows={REASON_ROWS}
            maxLength={INVALIDATION_REASON_MAX_LENGTH}
            placeholder={t(INVALIDATE_TEXT.REASON_PLACEHOLDER)}
            onChange={(event) => setReason(event.target.value)}
            className={tailwind(inputBaseClasses, 'block resize-none')}
          />
          <Typography variant={TypographyVariant.HELPER} className="text-right">
            {t(INVALIDATE_TEXT.REASON_COUNT, {
              current: reason.length,
              max: INVALIDATION_REASON_MAX_LENGTH,
            })}
          </Typography>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isLoading}>
            {t(INVALIDATE_TEXT.CANCEL)}
          </Button>
          <Button
            variant={ButtonVariant.DANGER}
            onClick={() => onConfirm(trimmedReason)}
            disabled={!canConfirm}
            isLoading={isLoading}
          >
            {t(INVALIDATE_TEXT.CONFIRM)}
          </Button>
        </div>
      </div>
    </div>
  );
};
