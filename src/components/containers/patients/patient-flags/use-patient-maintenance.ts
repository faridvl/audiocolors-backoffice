import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useUpdatePatientMaintenanceMutation } from '@/shared/api/mutations/patients/update-patient-maintenance-mutation';
import {
  getMaintenanceNote,
  isMaintenanceDone,
  MAINTENANCE_NOTE_MAX_LENGTH,
  MaintenanceNumber,
  Patient,
} from '@/types/patients/patient';

/** Cuánto se queda visible el "Guardado" junto al campo. */
const SAVED_FLASH_MS = 2000;
/** Filas máximas de la nota antes de que aparezca el scroll interno. */
const NOTE_MAX_ROWS = 8;

/**
 * Un mantenimiento del paciente: la casilla se guarda al tocarla y la nota al salir del campo,
 * solo si cambió. Mientras se escribe el texto vive en `draft`, y se queda ahí hasta que el
 * guardado se confirma para que, si falla, el usuario no pierda lo escrito.
 */
export function usePatientMaintenance(patient: Patient, maintenanceNumber: MaintenanceNumber) {
  const [draft, setDraft] = useState<string | null>(null);
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  const [hasNoteError, setHasNoteError] = useState(false);
  const [isDoneSaved, setIsDoneSaved] = useState(false);
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout>>();
  const noteTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      clearTimeout(doneTimer.current);
      clearTimeout(noteTimer.current);
    },
    [],
  );

  const flash = useCallback(
    (
      setSaved: (value: boolean) => void,
      timer: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
    ) => {
      setSaved(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setSaved(false), SAVED_FLASH_MS);
    },
    [],
  );

  const { saveDone, saveNote, isSavingDone, isSavingNote } = useUpdatePatientMaintenanceMutation(
    patient.uuid,
    maintenanceNumber,
    {
      onDoneSaved: () => flash(setIsDoneSaved, doneTimer),
      onNoteSaved: (savedValue) => {
        // Si el usuario siguió escribiendo mientras se guardaba, su texto nuevo se respeta.
        setDraft((current) =>
          current !== null && current.trim() !== (savedValue ?? '') ? current : null,
        );
        flash(setIsNoteSaved, noteTimer);
      },
      onNoteFailed: (failedValue) => {
        setDraft((current) => current ?? failedValue ?? '');
        setHasNoteError(true);
      },
    },
  );

  const savedNote = getMaintenanceNote(patient, maintenanceNumber) ?? '';
  const note = draft ?? savedNote;

  // La nota crece con el texto: parte de las filas mínimas y se detiene en NOTE_MAX_ROWS.
  useLayoutEffect(() => {
    const element = noteRef.current;
    if (!element) return;
    element.style.height = 'auto';
    const style = window.getComputedStyle(element);
    const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const maxHeight = (parseFloat(style.lineHeight) || 20) * NOTE_MAX_ROWS + padding + borders;
    element.style.height = `${Math.min(element.scrollHeight + borders, maxHeight)}px`;
  }, [note]);

  const handleDoneChange = (done: boolean) => {
    if (isSavingDone) return;
    setIsDoneSaved(false);
    saveDone(done);
  };

  const handleNoteChange = (value: string) => {
    setDraft(value.slice(0, MAINTENANCE_NOTE_MAX_LENGTH));
    setHasNoteError(false);
    setIsNoteSaved(false);
  };

  const handleNoteFocus = () => setIsNoteFocused(true);

  const handleNoteBlur = () => {
    setIsNoteFocused(false);
    if (draft === null) return;
    const nextNote = draft.trim();
    if (nextNote === savedNote) {
      setDraft(null);
      return;
    }
    saveNote(nextNote || null);
  };

  return {
    isDone: isMaintenanceDone(patient, maintenanceNumber),
    note,
    noteRef,
    isSavingDone,
    isSavingNote,
    isDoneSaved,
    isNoteSaved,
    isNoteFocused,
    hasNoteError,
    handleDoneChange,
    handleNoteChange,
    handleNoteFocus,
    handleNoteBlur,
  };
}
