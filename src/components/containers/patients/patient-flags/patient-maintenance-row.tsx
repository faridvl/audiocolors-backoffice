import React from "react";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, ButtonVariant } from "@/components/common/button/button";
import {
  SegmentedControl,
  SegmentedControlSize,
  SegmentedOption,
} from "@/components/common/segmented-control/segmented-control";
import {
  Typography,
  TypographyVariant,
} from "@/components/common/typography/typography";
import { TEXT } from "@/static/texts/i18n";
import { MaintenanceStatus } from "@/types/patients/patient";
import { MaintenanceNotesPanel } from "./maintenance-notes-panel";
import { MaintenanceRow } from "./use-patient-maintenance";

interface PatientMaintenanceRowProps {
  row: MaintenanceRow;
  patientUuid: string;
  options: SegmentedOption<MaintenanceStatus>[];
  isSaving: boolean;
  isLoadingNotes: boolean;
  hasNotesError: boolean;
  isOpen: boolean;
  onStatusChange: (status: MaintenanceStatus) => void;
  onToggleNotes: () => void;
}

/** Una línea por mantenimiento: título, estado y botón de notas; el panel de notas se abre debajo. */
export const PatientMaintenanceRow: React.FC<PatientMaintenanceRowProps> = ({
  row,
  patientUuid,
  options,
  isSaving,
  isLoadingNotes,
  hasNotesError,
  isOpen,
  onStatusChange,
  onToggleNotes,
}) => {
  const { t } = useTranslation();
  const title = t(TEXT.PATIENTS.FLAGS.MAINTENANCE.ROW_TITLE, {
    number: row.maintenanceNumber,
  });
  const panelId = `maintenance-notes-${row.maintenanceNumber}`;
  const noteCount = row.notes.length;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
        <Typography
          variant={TypographyVariant.BODY}
          className="order-1 min-w-0 flex-1 font-semibold text-ink-800"
        >
          {title}
        </Typography>
        <SegmentedControl
          options={options}
          value={row.status}
          onChange={onStatusChange}
          ariaLabel={title}
          size={SegmentedControlSize.COMPACT}
          isDisabled={isSaving}
          isFullWidth
          className="order-3 sm:order-2 sm:w-auto sm:shrink-0 sm:[&>button]:flex-none"
        />
        <Button
          variant={ButtonVariant.GHOST}
          onClick={onToggleNotes}
          aria-expanded={isOpen}
          aria-controls={panelId}
          icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
          className="order-2 min-h-[44px] px-2.5 py-1.5 text-brand-700 sm:order-3 sm:min-h-[36px]"
        >
          {noteCount > 0
            ? t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_BUTTON_COUNT, {
                count: noteCount,
              })
            : t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_BUTTON)}
        </Button>
      </div>
      {isOpen && (
        <MaintenanceNotesPanel
          id={panelId}
          patientUuid={patientUuid}
          maintenanceNumber={row.maintenanceNumber}
          notes={row.notes}
          isLoading={isLoadingNotes}
          hasError={hasNotesError}
        />
      )}
    </div>
  );
};
