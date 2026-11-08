import React, { useEffect, useState } from 'react';
import { MaintenanceNumber, MaintenanceStatus, Patient } from '@/types/patients/patient';
import { PatientMaintenanceRow } from './patient-maintenance-row';
import { useMaintenanceOpenRow } from './use-maintenance-open-row';
import { usePatientMaintenance } from './use-patient-maintenance';

/** Una línea por mantenimiento (1 a 4): la casilla se guarda al tocar y las notas se abren debajo. */
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
  const { openNumber, registerRow, getRowElement, handleOpen, handleToggle } =
    useMaintenanceOpenRow();
  // "Lo perdió" no guarda al tocar: espera la nota del mantenimiento que se está marcando.
  const [pendingMissed, setPendingMissed] = useState<MaintenanceNumber | null>(null);

  // Tocar fuera de la fila deja el estado como estaba.
  useEffect(() => {
    if (pendingMissed === null) return;
    const handlePointerDown = (event: PointerEvent) => {
      const row = getRowElement(pendingMissed);
      if (row && event.target instanceof Node && !row.contains(event.target)) {
        setPendingMissed(null);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [pendingMissed, getRowElement]);

  const handleChoice = (maintenanceNumber: MaintenanceNumber, status: MaintenanceStatus) => {
    if (status === MaintenanceStatus.MISSED) {
      setPendingMissed(maintenanceNumber);
      handleOpen(maintenanceNumber);
      return;
    }
    setPendingMissed(null);
    handleStatusChange(maintenanceNumber, status);
  };

  const handleMissedSaved = (maintenanceNumber: MaintenanceNumber) => {
    setPendingMissed(null);
    handleStatusChange(maintenanceNumber, MaintenanceStatus.MISSED);
  };

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
          isMissedPending={pendingMissed === row.maintenanceNumber}
          onStatusChange={(status) => handleChoice(row.maintenanceNumber, status)}
          onMissedSaved={() => handleMissedSaved(row.maintenanceNumber)}
          onMissedCancel={() => setPendingMissed(null)}
          rowRef={registerRow(row.maintenanceNumber)}
          onRetryNotes={handleRetryNotes}
          onToggleNotes={() => {
            if (pendingMissed === row.maintenanceNumber) setPendingMissed(null);
            handleToggle(row.maintenanceNumber);
          }}
        />
      ))}
    </div>
  );
};
