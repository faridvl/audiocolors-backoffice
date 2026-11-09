import React from 'react';
import { Patient } from '@/types/patients/patient';
import { PatientMaintenanceRow } from './patient-maintenance-row';
import { useMaintenanceOpenRow } from './use-maintenance-open-row';
import { usePatientMaintenance } from './use-patient-maintenance';

/** Una línea por mantenimiento (1 a 4): la casilla se guarda al tocar y las notas se abren debajo. */
export const PatientMaintenanceList: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { openNumber, registerRow, getRowElement, handleOpen, handleToggle } =
    useMaintenanceOpenRow();
  const {
    rows,
    handleChoice,
    handleToggleNotes,
    getMissedFlow,
    handleRetryNotes,
    isSaving,
    isLoadingNotes,
    isFetchingNotes,
    hasNotesError,
  } = usePatientMaintenance(patient, {
    getRowElement,
    openRow: handleOpen,
    toggleRow: handleToggle,
  });

  return (
    <div className="flex flex-col divide-y divide-ink-200">
      {rows.map((row) => (
        <PatientMaintenanceRow
          key={row.maintenanceNumber}
          row={row}
          patientUuid={patient.uuid}
          isSaving={isSaving}
          isLoadingNotes={isLoadingNotes}
          isFetchingNotes={isFetchingNotes}
          hasNotesError={hasNotesError}
          isOpen={openNumber === row.maintenanceNumber}
          missedFlow={getMissedFlow(row.maintenanceNumber)}
          onStatusChange={(status) => handleChoice(row.maintenanceNumber, status)}
          rowRef={registerRow(row.maintenanceNumber)}
          onRetryNotes={handleRetryNotes}
          onToggleNotes={() => handleToggleNotes(row.maintenanceNumber)}
        />
      ))}
    </div>
  );
};
