import React from "react";
import { useTranslation } from "react-i18next";
import { SegmentedOption } from "@/components/common/segmented-control/segmented-control";
import { TEXT } from "@/static/texts/i18n";
import { MaintenanceStatus, Patient } from "@/types/patients/patient";
import { MAINTENANCE_SELECTED_STYLES } from "./patient-maintenance-styles";
import { PatientMaintenanceRow } from "./patient-maintenance-row";
import { useMaintenanceOpenRow } from "./use-maintenance-open-row";
import { usePatientMaintenance } from "./use-patient-maintenance";

const MAINTENANCE_STATUSES = [
  MaintenanceStatus.UNMARKED,
  MaintenanceStatus.ATTENDED,
  MaintenanceStatus.MISSED,
];

/** Una línea por mantenimiento (1 a 4): el estado se guarda al tocar y las notas se abren debajo. */
export const PatientMaintenanceList: React.FC<{ patient: Patient }> = ({
  patient,
}) => {
  const { t } = useTranslation();
  const { rows, handleStatusChange, isSaving, isLoadingNotes, hasNotesError } =
    usePatientMaintenance(patient);
  const { openNumber, handleToggle } = useMaintenanceOpenRow();

  const options: SegmentedOption<MaintenanceStatus>[] =
    MAINTENANCE_STATUSES.map((status) => ({
      value: status,
      label: t(`${TEXT.PATIENTS.FLAGS.MAINTENANCE.OPTION_PREFIX}.${status}`),
      selectedClassName: MAINTENANCE_SELECTED_STYLES[status],
    }));

  return (
    <div className="flex flex-col divide-y divide-ink-100">
      {rows.map((row) => (
        <PatientMaintenanceRow
          key={row.maintenanceNumber}
          row={row}
          patientUuid={patient.uuid}
          options={options}
          isSaving={isSaving}
          isLoadingNotes={isLoadingNotes}
          hasNotesError={hasNotesError}
          isOpen={openNumber === row.maintenanceNumber}
          onStatusChange={(status) =>
            handleStatusChange(row.maintenanceNumber, status)
          }
          onToggleNotes={() => handleToggle(row.maintenanceNumber)}
        />
      ))}
    </div>
  );
};
