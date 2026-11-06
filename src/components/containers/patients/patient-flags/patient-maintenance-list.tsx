import React from 'react';
import { MaintenanceStatus, Patient } from '@/types/patients/patient';
import { MaintenanceChipStatus } from './patient-maintenance-styles';
import { PatientMaintenanceRow } from './patient-maintenance-row';
import { useMaintenanceOpenRow } from './use-maintenance-open-row';
import { usePatientMaintenance } from './use-patient-maintenance';

const MAINTENANCE_CHIP_STATUSES: MaintenanceChipStatus[] = [
  MaintenanceStatus.ATTENDED,
  MaintenanceStatus.MISSED,
];

/** Una línea por mantenimiento (1 a 4): el estado se guarda al tocar y las notas se abren debajo. */
export const PatientMaintenanceList: React.FC<{ patient: Patient }> = ({ patient }) => {
  const {
    rows,
    handleStatusChange,
    handleRetryNotes,
    isSaving,
    isLoadingNotes,
    isFetchingNotes,
    hasNotesError,
  } = usePatientMaintenance(patient);
  const { openNumber, registerRow, handleToggle } = useMaintenanceOpenRow();

  return (
    <div className="flex flex-col divide-y divide-ink-100">
      {rows.map((row) => (
        <PatientMaintenanceRow
          key={row.maintenanceNumber}
          row={row}
          patientUuid={patient.uuid}
          chipStatuses={MAINTENANCE_CHIP_STATUSES}
          isSaving={isSaving}
          isLoadingNotes={isLoadingNotes}
          isFetchingNotes={isFetchingNotes}
          hasNotesError={hasNotesError}
          isOpen={openNumber === row.maintenanceNumber}
          onStatusChange={(status) => handleStatusChange(row.maintenanceNumber, status)}
          rowRef={registerRow(row.maintenanceNumber)}
          onRetryNotes={handleRetryNotes}
          onToggleNotes={() => handleToggle(row.maintenanceNumber)}
        />
      ))}
    </div>
  );
};
