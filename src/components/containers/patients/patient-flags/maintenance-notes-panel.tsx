import React from "react";
import { useTranslation } from "react-i18next";
import {
  Typography,
  TypographyVariant,
} from "@/components/common/typography/typography";
import { TEXT } from "@/static/texts/i18n";
import { MaintenanceNumber } from "@/types/patients/patient";
import { MaintenanceNote } from "@/types/patients/patient-maintenance";
import { MaintenanceNoteForm } from "./maintenance-note-form";
import { MaintenanceNoteHistory } from "./maintenance-note-history";

interface MaintenanceNotesPanelProps {
  id: string;
  patientUuid: string;
  maintenanceNumber: MaintenanceNumber;
  notes: MaintenanceNote[];
  isLoading: boolean;
  hasError: boolean;
}

/** Panel que se abre bajo la fila: historial de notas y el campo para agregar una. */
export const MaintenanceNotesPanel: React.FC<MaintenanceNotesPanelProps> = ({
  id,
  patientUuid,
  maintenanceNumber,
  notes,
  isLoading,
  hasError,
}) => {
  const { t } = useTranslation();

  return (
    <div id={id} className="flex min-w-0 flex-col gap-2 pb-3">
      <Typography variant={TypographyVariant.HELPER}>
        {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.HINT)}
      </Typography>
      {isLoading ? (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_LOADING)}
        </Typography>
      ) : hasError ? (
        <Typography variant={TypographyVariant.ERROR}>
          {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.NOTES_ERROR)}
        </Typography>
      ) : (
        <MaintenanceNoteHistory notes={notes} />
      )}
      <MaintenanceNoteForm
        patientUuid={patientUuid}
        maintenanceNumber={maintenanceNumber}
      />
    </div>
  );
};
