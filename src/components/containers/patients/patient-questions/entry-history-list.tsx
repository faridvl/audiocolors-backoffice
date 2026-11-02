import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDateTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface DatedEntry {
  uuid: string;
  createdAt: string;
}

interface EntryHistoryListProps<T extends DatedEntry> {
  /** Del más nuevo al más viejo. */
  entries: T[];
  getAuthor: (entry: T) => string;
  renderEntry: (entry: T) => React.ReactNode;
}

const EntryBlock = <T extends DatedEntry>({
  entry,
  title,
  getAuthor,
  renderEntry,
}: {
  entry: T;
  title?: string;
} & Pick<EntryHistoryListProps<T>, 'getAuthor' | 'renderEntry'>) => {
  const { t } = useTranslation();

  return (
    <article className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        {title && <Typography variant={TypographyVariant.SUBTITLE}>{title}</Typography>}
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.QUESTIONS.ENTRY_META, {
            date: formatDateTime(entry.createdAt),
            author: getAuthor(entry),
          })}
        </Typography>
      </div>
      {renderEntry(entry)}
    </article>
  );
};

/** Registros con fecha y autor: el último a la vista y los anteriores detrás de "Ver anteriores". */
export const EntryHistoryList = <T extends DatedEntry>({
  entries,
  getAuthor,
  renderEntry,
}: EntryHistoryListProps<T>) => {
  const { t } = useTranslation();
  const [showsOlder, setShowsOlder] = useState(false);
  const [latest, ...older] = entries;

  if (!latest) return null;

  return (
    <div className="flex flex-col gap-5">
      <EntryBlock
        entry={latest}
        title={t(TEXT.QUESTIONS.ENTRY_LATEST)}
        getAuthor={getAuthor}
        renderEntry={renderEntry}
      />

      {older.length > 0 && (
        <>
          <Button
            type="button"
            variant={ButtonVariant.GHOST}
            onClick={() => setShowsOlder((current) => !current)}
            aria-expanded={showsOlder}
            icon={
              <ChevronDown
                className={tailwind('h-4 w-4 transition-transform', showsOlder && 'rotate-180')}
                aria-hidden
              />
            }
            className="self-start"
          >
            {showsOlder
              ? t(TEXT.QUESTIONS.ENTRY_HIDE_OLDER)
              : t(TEXT.QUESTIONS.ENTRY_SHOW_OLDER, { count: older.length })}
          </Button>

          {showsOlder &&
            older.map((entry) => (
              <div key={entry.uuid} className="border-t border-ink-100 pt-5">
                <EntryBlock entry={entry} getAuthor={getAuthor} renderEntry={renderEntry} />
              </div>
            ))}
        </>
      )}
    </div>
  );
};
