import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { MaintenanceStatus } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';
import { MaintenanceNotesPanel } from './maintenance-notes-panel';
import { MAINTENANCE_NOTES_BUTTON_STYLES } from './patient-maintenance-styles';
import { MaintenanceRow } from './use-patient-maintenance';

interface PatientMaintenanceRowProps {
  row: MaintenanceRow;
  patientUuid: string;
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

/** Una línea por mantenimiento: casilla con su título y, a la derecha, el acceso a las notas. */
export const PatientMaintenanceRow: React.FC<PatientMaintenanceRowProps> = ({
  row,
  patientUuid,
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
  const checkboxId = `maintenance-check-${row.maintenanceNumber}`;
  const noteCount = row.notes.length;

  const notesText = () => {
    if (hasNotesError) return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_UNKNOWN);
    if (noteCount > 0) {
      return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_COUNT, {
        count: noteCount,
      });
    }
    return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_EMPTY);
  };

  return (
    <div ref={rowRef} className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={checkboxId}
          className={tailwind(
            'flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-sm font-semibold text-ink-800 md:text-base',
            isSaving ? 'cursor-wait' : 'cursor-pointer',
          )}
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={row.status === MaintenanceStatus.ATTENDED}
            disabled={isSaving}
            onChange={(event) =>
              onStatusChange(
                event.target.checked ? MaintenanceStatus.ATTENDED : MaintenanceStatus.UNMARKED,
              )
            }
            className="h-5 w-5 shrink-0 cursor-[inherit] accent-brand"
          />
          <span className="truncate">{title}</span>
        </label>
        <button
          type="button"
          onClick={onToggleNotes}
          disabled={isLoadingNotes}
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_LABEL, {
            action: notesText(),
            title,
          })}
          className={tailwind(
            'min-h-[44px] shrink-0 whitespace-nowrap rounded-lg px-2 text-sm text-ink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand',
            MAINTENANCE_NOTES_BUTTON_STYLES,
          )}
        >
          {isLoadingNotes ? (
            <span
              aria-hidden="true"
              className="inline-block h-3 w-12 animate-pulse rounded bg-ink-100"
            />
          ) : (
            <span aria-hidden="true">{notesText()}</span>
          )}
        </button>
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
