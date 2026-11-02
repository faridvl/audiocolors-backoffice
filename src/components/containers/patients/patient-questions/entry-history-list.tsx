import React, { useState } from 'react';
import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDateTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { EntryHistoryModal } from './entry-history-modal';
import { DatedEntry, EntryRenderer } from './entry-history-types';

interface EntryHistoryListProps<T extends DatedEntry> extends EntryRenderer<T> {
  /** Del más nuevo al más viejo. */
  entries: T[];
  /** Qué historial es (por ejemplo, el nombre de la sección): va bajo el título del modal. */
  historyLabel: string;
  /** Acción junto al último registro (por ejemplo, "Editar"); sin ella no se pinta. */
  renderLatestAction?: (entry: T) => React.ReactNode;
}

/** Registros con fecha y autor: el último a la vista y los anteriores en un modal. */
export const EntryHistoryList = <T extends DatedEntry>({
  entries,
  historyLabel,
  getAuthor,
  getCorrection,
  renderEntry,
  renderLatestAction,
}: EntryHistoryListProps<T>) => {
  const { t } = useTranslation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [latest, ...older] = entries;

  if (!latest) return null;

  const correction = getCorrection?.(latest);

  return (
    <div className="flex flex-col gap-5">
      <article className="flex w-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Typography variant={TypographyVariant.SUBTITLE}>
              {t(TEXT.QUESTIONS.ENTRY_LATEST)}
            </Typography>
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.QUESTIONS.ENTRY_META, {
                date: formatDateTime(latest.createdAt),
                author: getAuthor(latest),
              })}
            </Typography>
            {correction && <Typography variant={TypographyVariant.HELPER}>{correction}</Typography>}
          </div>
          {renderLatestAction?.(latest)}
        </div>
        {renderEntry(latest, { isMuted: false })}
      </article>

      {older.length > 0 && (
        <>
          <Button
            type="button"
            variant={ButtonVariant.GHOST}
            onClick={() => setIsHistoryOpen(true)}
            icon={<History className="h-4 w-4" aria-hidden />}
            className="self-start"
          >
            {t(TEXT.QUESTIONS.ENTRY_SHOW_OLDER, { count: older.length })}
          </Button>

          {isHistoryOpen && (
            <EntryHistoryModal
              label={historyLabel}
              entries={older}
              getAuthor={getAuthor}
              getCorrection={getCorrection}
              renderEntry={renderEntry}
              onClose={() => setIsHistoryOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};
