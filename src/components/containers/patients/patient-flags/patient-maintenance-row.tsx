import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { MaintenanceStatus } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';
import { MaintenanceNotesPanel } from './maintenance-notes-panel';
import { MaintenanceStatusChip } from './maintenance-status-chip';
import {
  MAINTENANCE_NOTES_BUTTON_STYLES,
  MaintenanceChipStatus,
} from './patient-maintenance-styles';
import { MaintenanceRow } from './use-patient-maintenance';

interface PatientMaintenanceRowProps {
  row: MaintenanceRow;
  patientUuid: string;
  chipStatuses: MaintenanceChipStatus[];
  isSaving: boolean;
  isLoadingNotes: boolean;
  isFetchingNotes: boolean;
  hasNotesError: boolean;
  isOpen: boolean;
  rowRef: (element: HTMLElement | null) => void;
  onStatusChange: (status: MaintenanceStatus) => void;
  onToggleNotes: () => void;
  onRetryNotes: () => void;
}

/** Una línea por mantenimiento: título, chips de estado e ícono de notas; el panel se abre debajo. */
export const PatientMaintenanceRow: React.FC<PatientMaintenanceRowProps> = ({
  row,
  patientUuid,
  chipStatuses,
  isSaving,
  isLoadingNotes,
  isFetchingNotes,
  hasNotesError,
  isOpen,
  rowRef,
  onStatusChange,
  onToggleNotes,
  onRetryNotes,
}) => {
  const { t } = useTranslation();
  const values = { number: row.maintenanceNumber };
  const title = t(TEXT.PATIENTS.FLAGS.MAINTENANCE.ROW_TITLE, values);
  const panelId = `maintenance-notes-${row.maintenanceNumber}`;
  const noteCount = row.notes.length;

  const notesLabel = () => {
    if (hasNotesError) return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_UNKNOWN, values);
    if (noteCount > 0) {
      return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_COUNT, { ...values, count: noteCount });
    }
    return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_EMPTY, values);
  };

  return (
    <div ref={rowRef} className="min-w-0">
      <div className="flex items-center justify-between gap-2 py-0.5">
        <Typography
          variant={TypographyVariant.BODY}
          className="min-w-0 truncate font-semibold text-ink-800"
        >
          <span className="sm:hidden">
            {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.ROW_TITLE_SHORT, values)}
          </span>
          <span className="hidden sm:inline">{title}</span>
        </Typography>
        <div role="group" aria-label={title} className="flex shrink-0 items-center gap-1.5">
          {chipStatuses.map((status) => (
            <MaintenanceStatusChip
              key={status}
              status={status}
              label={t(`${TEXT.PATIENTS.FLAGS.MAINTENANCE.OPTION_PREFIX}.${status}`)}
              isSelected={row.status === status}
              isDisabled={isSaving}
              onToggle={() =>
                onStatusChange(row.status === status ? MaintenanceStatus.UNMARKED : status)
              }
            />
          ))}
          <Button
            variant={ButtonVariant.GHOST}
            onClick={onToggleNotes}
            disabled={isLoadingNotes}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={notesLabel()}
            className={tailwind(
              'min-w-[44px] gap-1 px-2 py-1.5 text-brand-700',
              MAINTENANCE_NOTES_BUTTON_STYLES,
            )}
          >
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
            {isLoadingNotes ? (
              <span aria-hidden="true" className="h-3 w-3 animate-pulse rounded bg-ink-200" />
            ) : (
              noteCount > 0 && <span aria-hidden="true">{noteCount}</span>
            )}
          </Button>
        </div>
      </div>
      {isOpen && (
        <MaintenanceNotesPanel
          id={panelId}
          patientUuid={patientUuid}
          maintenanceNumber={row.maintenanceNumber}
          notes={row.notes}
          isLoading={isLoadingNotes}
          hasError={hasNotesError}
          isRetrying={isFetchingNotes}
          onRetry={onRetryNotes}
        />
      )}
    </div>
  );
};
