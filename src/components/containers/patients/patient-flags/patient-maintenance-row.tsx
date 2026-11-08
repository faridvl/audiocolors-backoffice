import { Check, ChevronDown, MessageSquare, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { TEXT } from "@/static/texts/i18n";
import { MaintenanceStatus } from "@/types/patients/patient";
import { tailwind } from "@/utils/tailwind-utils";
import { MaintenanceNotesPanel } from "./maintenance-notes-panel";
import {
  MAINTENANCE_CHOICE_ACTIVE_STYLES,
  MAINTENANCE_CHOICE_BASE_STYLES,
  MAINTENANCE_CHOICE_ICON_STYLES,
  MAINTENANCE_CHOICE_INACTIVE_STYLES,
  MAINTENANCE_NOTES_BUTTON_STYLES,
  MAINTENANCE_NOTES_CHEVRON_STYLES,
} from "./patient-maintenance-styles";
import { MaintenanceRow } from "./use-patient-maintenance";

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

/** El ícono del botón activo refuerza el color: el estado no depende solo del tono. */
const CHOICES = [
  {
    status: MaintenanceStatus.ATTENDED,
    label: TEXT.PATIENTS.FLAGS.MAINTENANCE.CHOICE_ATTENDED,
    Icon: Check,
  },
  {
    status: MaintenanceStatus.MISSED,
    label: TEXT.PATIENTS.FLAGS.MAINTENANCE.CHOICE_MISSED,
    Icon: X,
  },
] as const;

/**
 * Una línea por mantenimiento: título, "Vino" / "Lo perdió" y el acceso a las notas.
 * Tocar el botón activo vuelve a pendiente.
 */
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
  const noteCount = row.notes.length;

  const notesText = () => {
    if (hasNotesError)
      return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_UNKNOWN);
    if (noteCount > 0) {
      return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_COUNT, {
        count: noteCount,
      });
    }
    return t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_TOGGLE_EMPTY);
  };

  return (
    <div ref={rowRef} className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-1 md:gap-x-4">
        <span className="min-w-[8rem] flex-1 truncate text-sm font-semibold text-ink-800 md:text-base">
          {title}
        </span>
        <div
          role="group"
          aria-label={title}
          className="flex shrink-0 items-center gap-2 md:ml-2"
        >
          {CHOICES.map(({ status, label, Icon }) => {
            const isActive = row.status === status;
            const choiceLabel = t(label);
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isActive}
                aria-label={t(TEXT.PATIENTS.FLAGS.MAINTENANCE.CHOICE_LABEL, {
                  number: row.maintenanceNumber,
                  choice: choiceLabel,
                })}
                disabled={isSaving}
                onClick={() =>
                  onStatusChange(isActive ? MaintenanceStatus.UNMARKED : status)
                }
                className={tailwind(
                  MAINTENANCE_CHOICE_BASE_STYLES,
  MAINTENANCE_CHOICE_ICON_STYLES,
                  isActive
                    ? MAINTENANCE_CHOICE_ACTIVE_STYLES[status]
                    : MAINTENANCE_CHOICE_INACTIVE_STYLES,
                )}
              >
                {isActive && (
                  <Icon
                    aria-hidden="true"
                    className={MAINTENANCE_CHOICE_ICON_STYLES}
                  />
                )}
                {choiceLabel}
              </button>
            );
          })}
        </div>
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
            "ml-auto flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 text-sm font-medium text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand",
            MAINTENANCE_NOTES_BUTTON_STYLES,
            isOpen && "bg-brand-50",
          )}
        >
          {isLoadingNotes ? (
            <span
              aria-hidden="true"
              className="inline-block h-3 w-12 animate-pulse rounded bg-ink-100"
            />
          ) : (
            <>
              <MessageSquare aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span aria-hidden="true">{notesText()}</span>
              <ChevronDown
                aria-hidden="true"
                className={tailwind(
                  "h-4 w-4 shrink-0",
                  MAINTENANCE_NOTES_CHEVRON_STYLES,
                  isOpen && "rotate-180",
                )}
              />
            </>
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
