import { useEffect, useRef, useState } from 'react';
import { useCreateMaintenanceNoteMutation } from '@/shared/api/mutations/patients/create-maintenance-note-mutation';
import { useUpdatePatientMaintenanceMutation } from '@/shared/api/mutations/patients/update-patient-maintenance-mutation';
import { usePatientMaintenancesQuery } from '@/shared/api/querys/patient-maintenances-query';
import {
  getMaintenanceStatus,
  MAINTENANCE_NUMBERS,
  MaintenanceNumber,
  MaintenanceStatus,
  Patient,
} from '@/types/patients/patient';
import { MaintenanceNote } from '@/types/patients/patient-maintenance';

export interface MaintenanceRow {
  maintenanceNumber: MaintenanceNumber;
  status: MaintenanceStatus;
  notes: MaintenanceNote[];
}

export enum MissedSaveResult {
  SAVED = 'SAVED',
  NOTE_FAILED = 'NOTE_FAILED',
  STATUS_FAILED = 'STATUS_FAILED',
}

/** "Lo perdió" en curso en una fila: la nota y el estado los guarda el hook, no el formulario. */
export interface MissedFlow {
  isSaving: boolean;
  /** La nota ya quedó guardada y solo falta el estado: se reintenta sin escribir otra. */
  hasStatusError: boolean;
  onSaveNote: (text: string) => Promise<MissedSaveResult>;
  onRetryStatus: () => void;
  onCancel: () => void;
}

interface RowControls {
  getRowElement: (maintenanceNumber: MaintenanceNumber) => HTMLElement | undefined;
  openRow: (maintenanceNumber: MaintenanceNumber) => void;
  toggleRow: (maintenanceNumber: MaintenanceNumber) => void;
}

/**
 * Los mantenimientos 1 a 4: el estado sale del paciente (siempre al día tras guardar) y las
 * notas de su propia consulta, que se pide al abrir la pestaña.
 */
export function usePatientMaintenance(patient: Patient, rowControls: RowControls) {
  const { getRowElement, openRow, toggleRow } = rowControls;
  const { executeUpdatePatientMaintenanceAsync, isPending } = useUpdatePatientMaintenanceMutation();
  const { executeCreateMaintenanceNoteAsync } = useCreateMaintenanceNoteMutation();
  const {
    data: maintenances,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePatientMaintenancesQuery(patient.uuid);
  // "Lo perdió" no guarda al tocar: espera la nota del mantenimiento que se está marcando.
  const [pendingMissed, setPendingMissed] = useState<MaintenanceNumber | null>(null);
  const [isMissedSaving, setIsMissedSaving] = useState(false);
  const [hasMissedStatusError, setHasMissedStatusError] = useState(false);
  // Los cambios de estado se encadenan: ninguno se descarta por haber otro en curso.
  const statusQueue = useRef<Promise<unknown>>(Promise.resolve());

  const rows: MaintenanceRow[] = MAINTENANCE_NUMBERS.map((maintenanceNumber) => ({
    maintenanceNumber,
    status: getMaintenanceStatus(patient, maintenanceNumber),
    notes: maintenances?.find((item) => item.number === maintenanceNumber)?.notes ?? [],
  }));

  const clearMissed = () => {
    setPendingMissed(null);
    setHasMissedStatusError(false);
  };

  // Tocar fuera de la fila deja el estado como estaba, salvo mientras se guarda.
  useEffect(() => {
    if (pendingMissed === null || isMissedSaving) return;
    const handlePointerDown = (event: PointerEvent) => {
      const row = getRowElement(pendingMissed);
      if (row && event.target instanceof Node && !row.contains(event.target)) {
        setPendingMissed(null);
        setHasMissedStatusError(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [pendingMissed, isMissedSaving, getRowElement]);

  const updateStatus = (maintenanceNumber: MaintenanceNumber, status: MaintenanceStatus) => {
    const next = statusQueue.current
      .catch(() => undefined)
      .then(() =>
        executeUpdatePatientMaintenanceAsync({
          patientUuid: patient.uuid,
          maintenanceNumber,
          status,
        }),
      );
    statusQueue.current = next;
    return next;
  };

  const handleStatusChange = (maintenanceNumber: MaintenanceNumber, status: MaintenanceStatus) => {
    if (status === getMaintenanceStatus(patient, maintenanceNumber)) return;
    // El error ya lo muestra la mutación con un toast.
    updateStatus(maintenanceNumber, status).catch(() => undefined);
  };

  const applyMissedStatus = async (maintenanceNumber: MaintenanceNumber) => {
    setIsMissedSaving(true);
    setHasMissedStatusError(false);
    try {
      await updateStatus(maintenanceNumber, MaintenanceStatus.MISSED);
      clearMissed();
      return MissedSaveResult.SAVED;
    } catch {
      setHasMissedStatusError(true);
      return MissedSaveResult.STATUS_FAILED;
    } finally {
      setIsMissedSaving(false);
    }
  };

  const saveMissedNote = async (maintenanceNumber: MaintenanceNumber, text: string) => {
    setIsMissedSaving(true);
    try {
      await executeCreateMaintenanceNoteAsync({
        patientUuid: patient.uuid,
        maintenanceNumber,
        text,
      });
    } catch {
      setIsMissedSaving(false);
      return MissedSaveResult.NOTE_FAILED;
    }
    return applyMissedStatus(maintenanceNumber);
  };

  const handleChoice = (maintenanceNumber: MaintenanceNumber, status: MaintenanceStatus) => {
    if (isMissedSaving) return;
    if (status === MaintenanceStatus.MISSED) {
      setPendingMissed(maintenanceNumber);
      setHasMissedStatusError(false);
      openRow(maintenanceNumber);
      return;
    }
    clearMissed();
    handleStatusChange(maintenanceNumber, status);
  };

  const handleToggleNotes = (maintenanceNumber: MaintenanceNumber) => {
    if (isMissedSaving) return;
    if (pendingMissed === maintenanceNumber) clearMissed();
    toggleRow(maintenanceNumber);
  };

  const getMissedFlow = (maintenanceNumber: MaintenanceNumber): MissedFlow | null =>
    pendingMissed === maintenanceNumber
      ? {
          isSaving: isMissedSaving,
          hasStatusError: hasMissedStatusError,
          onSaveNote: (text) => saveMissedNote(maintenanceNumber, text),
          onRetryStatus: () => void applyMissedStatus(maintenanceNumber),
          onCancel: () => {
            if (!isMissedSaving) clearMissed();
          },
        }
      : null;

  return {
    rows,
    handleChoice,
    handleToggleNotes,
    getMissedFlow,
    handleRetryNotes: () => {
      void refetch();
    },
    isSaving: isPending || isMissedSaving,
    isLoadingNotes: isLoading,
    isFetchingNotes: isFetching,
    hasNotesError: isError,
  };
}
