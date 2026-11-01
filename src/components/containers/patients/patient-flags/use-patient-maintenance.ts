import { useState } from 'react';
import { useUpdatePatientMaintenanceMutation } from '@/shared/api/mutations/patients/update-patient-maintenance-mutation';
import {
  getMaintenanceNote,
  isMaintenanceDone,
  MAINTENANCE_NOTE_MAX_LENGTH,
  MaintenanceNumber,
  Patient,
} from '@/types/patients/patient';

/**
 * Un mantenimiento del paciente: la casilla se guarda al tocarla y la nota al salir del campo,
 * solo si cambió. Mientras se escribe el texto vive en `draft`; sin editar se muestra lo guardado.
 */
export function usePatientMaintenance(patient: Patient, maintenanceNumber: MaintenanceNumber) {
  const { executeUpdatePatientMaintenance } = useUpdatePatientMaintenanceMutation(
    patient.uuid,
    maintenanceNumber,
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [isSavingDone, setIsSavingDone] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [hasNoteError, setHasNoteError] = useState(false);

  const savedNote = getMaintenanceNote(patient, maintenanceNumber) ?? '';
  const note = draft ?? savedNote;

  const handleDoneChange = (done: boolean) => {
    if (isSavingDone) return;
    setIsSavingDone(true);
    executeUpdatePatientMaintenance({ done }, { onSettled: () => setIsSavingDone(false) });
  };

  const handleNoteChange = (value: string) => {
    setDraft(value.slice(0, MAINTENANCE_NOTE_MAX_LENGTH));
    setHasNoteError(false);
  };

  const handleNoteBlur = () => {
    if (draft === null) return;
    const nextNote = draft.trim();
    if (nextNote === savedNote) {
      setDraft(null);
      return;
    }
    setIsSavingNote(true);
    // El valor nuevo ya se ve desde la caché; si falla, vuelve el texto para reintentar.
    setDraft(null);
    executeUpdatePatientMaintenance(
      { note: nextNote || null },
      {
        onError: () => {
          setDraft(nextNote);
          setHasNoteError(true);
        },
        onSettled: () => setIsSavingNote(false),
      },
    );
  };

  return {
    isDone: isMaintenanceDone(patient, maintenanceNumber),
    note,
    isSavingDone,
    isSavingNote,
    hasNoteError,
    handleDoneChange,
    handleNoteChange,
    handleNoteBlur,
  };
}
