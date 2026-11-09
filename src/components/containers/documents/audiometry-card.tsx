import React from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { CategoryPill } from '@/components/common/badge/category-pill';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { AudiometryTypeCode } from '@/components/containers/patients/patient-audiometry/audiometry-constants';
import { SCREENING_RESULT_LABEL_KEYS } from '@/components/containers/patients/patient-audiometry/audiometry-labels';
import { DOCUMENT_CATEGORY_LABELS, DocumentCategory } from '@/types/documents/document.types';
import { TEXT } from '@/static/texts/i18n';
import { AudiometryArchiveItem } from './archive-items';

const MISSING_PTA_DASH = '–';

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
      aria-label={t(TEXT.DOCUMENTS.AUDIOMETRY.OPEN_LABEL, {
        date: item.dateLabel,
      })}
      className="group flex flex-col items-start gap-1.5 overflow-hidden rounded-card border border-ink-200 bg-white p-4 text-left transition-shadow hover:shadow-md"
    >
      <span className="flex w-full min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10">
          <Activity className="h-4 w-4 text-info" aria-hidden />
        </span>
        <Typography variant={TypographyVariant.HELPER} className="min-w-0 truncate text-ink-700">
          {item.displayName}
        </Typography>
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      </span>
      <CategoryPill>{DOCUMENT_CATEGORY_LABELS[DocumentCategory.EXTERNAL_TEST]}</CategoryPill>
      <Typography variant={TypographyVariant.HELPER} className="mt-1.5">
        {t(TEXT.DOCUMENTS.AUDIOMETRY.DETAIL)}
      </Typography>
      <Typography variant={TypographyVariant.HELPER}>{item.typeName}</Typography>
      <Typography variant={TypographyVariant.HELPER}>{item.dateLabel}</Typography>
      <Typography variant={TypographyVariant.HELPER} className="font-semibold text-ink-700">
        {item.typeCode === AudiometryTypeCode.SCREENING
          ? item.screeningResult
            ? t(SCREENING_RESULT_LABEL_KEYS[item.screeningResult])
            : MISSING_PTA_DASH
          : t(TEXT.DOCUMENTS.AUDIOMETRY.PTA_SUMMARY, {
              right: item.ptaRight ?? MISSING_PTA_DASH,
              left: item.ptaLeft ?? MISSING_PTA_DASH,
            })}
      </Typography>
      <Typography variant={TypographyVariant.HELPER}>
        {t(TEXT.DOCUMENTS.LIST.REGISTERED_BY)}{' '}
        <span className="italic">{resolveAuthorLabel(item.createdByUuid, item.createdByName)}</span>
      </Typography>
    </button>
  );
};
