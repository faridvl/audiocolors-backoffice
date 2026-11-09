import React from 'react';
import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { TEXT } from '@/static/texts/i18n';
import { AudiometryArchiveItem } from './archive-items';

interface AudiometryCardProps {
  item: AudiometryArchiveItem;
  onOpen: () => void;
}

/** Misma tarjeta que un archivo, pero de solo lectura: se abre, no se edita ni se borra. */
export const AudiometryCard: React.FC<AudiometryCardProps> = ({ item, onOpen }) => {
  const { t } = useTranslation();
  const resolveAuthorLabel = useResolveAuthorLabel();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t(TEXT.DOCUMENTS.AUDIOMETRY.OPEN_LABEL, { date: item.dateLabel })}
      className="group flex flex-col items-start gap-1.5 overflow-hidden rounded-card border border-ink-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
    >
      <span className="flex w-full min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50">
          <Activity className="h-4 w-4 text-brand-600" aria-hidden />
        </span>
        <Typography variant={TypographyVariant.HELPER} className="min-w-0 truncate text-ink-700">
          {item.displayName}
        </Typography>
        {item.isInvalidated && (
          <span className="shrink-0 rounded bg-danger/10 px-1.5 py-0.5 text-xs font-semibold text-danger">
            {t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.INVALIDATE.TAG)}
          </span>
        )}
      </span>
      <Typography variant={TypographyVariant.HELPER} className="mt-1.5">
        {item.dateLabel}
      </Typography>
      <Typography variant={TypographyVariant.HELPER}>
        {t(TEXT.DOCUMENTS.LIST.REGISTERED_BY)}{' '}
        <span className="italic">{resolveAuthorLabel(item.createdByUuid, item.createdByName)}</span>
      </Typography>
      {item.isInvalidated && item.invalidationReason && (
        <Typography variant={TypographyVariant.HELPER} className="text-danger-700">
          {t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.INVALIDATE.BANNER_REASON, {
            reason: item.invalidationReason,
          })}
        </Typography>
      )}
    </button>
  );
};
