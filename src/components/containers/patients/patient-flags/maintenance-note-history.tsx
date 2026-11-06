import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDateTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { MaintenanceNote } from '@/types/patients/patient-maintenance';
import { useMaintenanceNotes } from './use-maintenance-notes';

/** Historial de notas de un mantenimiento, de la más nueva a la más vieja; no se edita ni se borra. */
export const MaintenanceNoteHistory: React.FC<{ notes: MaintenanceNote[] }> = ({ notes }) => {
  const { t } = useTranslation();
  const { visibleNotes, canExpand, isExpanded, total, handleToggle } = useMaintenanceNotes(notes);

  if (notes.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {visibleNotes.map((note) => (
          <li
            key={note.uuid}
            className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-white px-3 py-2"
          >
            <Typography
              variant={TypographyVariant.BODY}
              className="whitespace-pre-wrap break-words"
            >
              {note.text}
            </Typography>
            <Typography variant={TypographyVariant.HELPER}>
              {note.createdByName
                ? t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTE_META, {
                    date: formatDateTime(note.createdAt),
                    author: note.createdByName,
                  })
                : formatDateTime(note.createdAt)}
            </Typography>
          </li>
        ))}
      </ul>
      {canExpand && (
        <Button
          variant={ButtonVariant.GHOST}
          onClick={handleToggle}
          aria-expanded={isExpanded}
          className="min-h-[44px] w-fit px-2 text-brand-700 hover:underline"
        >
          {isExpanded
            ? t(TEXT.PATIENTS.FLAGS.MAINTENANCE.SHOW_LESS)
            : t(TEXT.PATIENTS.FLAGS.MAINTENANCE.SHOW_ALL, { count: total })}
        </Button>
      )}
    </div>
  );
};
