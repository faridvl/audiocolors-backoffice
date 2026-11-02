import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionHeadingLevel,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { Badge } from '@/components/common/badge/badge';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { SheetDialog } from '@/components/containers/agenda/sheet-dialog';
import { formatDateTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { DatedEntry, EntryRenderer } from './entry-history-types';

interface EntryHistoryModalProps<T extends DatedEntry> extends EntryRenderer<T> {
  /** Qué historial es (por ejemplo, el nombre de la sección), bajo el título. */
  label: string;
  /** Del más nuevo al más viejo. */
  entries: T[];
  onClose: () => void;
}

/** Lista de fechas, cada una colapsable: al abrirla muestra el registro de ese día. */
export const EntryHistoryModal = <T extends DatedEntry>({
  label,
  entries,
  getAuthor,
  getCorrection,
  getPreview,
  renderEntry,
  onClose,
}: EntryHistoryModalProps<T>) => {
  const { t } = useTranslation();
  const [expandedUuids, setExpandedUuids] = useState<string[]>([]);

  const toggle = (uuid: string) =>
    setExpandedUuids((current) =>
      current.includes(uuid) ? current.filter((item) => item !== uuid) : [...current, uuid],
    );

  return (
    <SheetDialog title={t(TEXT.QUESTIONS.ENTRIES_PREVIOUS)} status={label} onClose={onClose}>
      <div className="mt-4 flex flex-col gap-2">
        {entries.map((entry) => {
          const correction = getCorrection?.(entry);
          const preview = getPreview?.(entry);
          const closedPreview =
            preview || correction ? (
              <span className="mt-1 flex min-w-0 items-center gap-2">
                {preview && (
                  <Typography
                    variant={TypographyVariant.HELPER}
                    as="span"
                    className="block min-w-0 flex-1 truncate text-ink-600"
                  >
                    {preview}
                  </Typography>
                )}
                {correction && <Badge>{t(TEXT.QUESTIONS.ENTRY_CORRECTED_TAG)}</Badge>}
              </span>
            ) : undefined;
          return (
            <Accordion
              key={entry.uuid}
              variant={AccordionVariant.NESTED}
              headingLevel={AccordionHeadingLevel.H3}
              title={formatDateTime(entry.createdAt)}
              subtitle={getAuthor(entry)}
              isExpanded={expandedUuids.includes(entry.uuid)}
              onToggle={() => toggle(entry.uuid)}
              isLazy
              closedPreview={closedPreview}
            >
              {correction && (
                <Typography variant={TypographyVariant.HELPER}>{correction}</Typography>
              )}
              {renderEntry(entry, { isMuted: false })}
            </Accordion>
          );
        })}
      </div>
    </SheetDialog>
  );
};
