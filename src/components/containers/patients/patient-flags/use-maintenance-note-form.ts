import { useLayoutEffect, useRef, useState } from 'react';
import { useCreateMaintenanceNoteMutation } from '@/shared/api/mutations/patients/create-maintenance-note-mutation';
import { MAINTENANCE_NOTE_MAX_LENGTH, MaintenanceNumber } from '@/types/patients/patient';

/** Filas máximas del campo antes de que aparezca el scroll interno. */
const NOTE_MAX_ROWS = 8;

/**
 * Redacta una nota nueva de un mantenimiento. El texto vive en `draft` hasta que el guardado
 * se confirma: si falla, el campo sigue abierto con lo escrito.
 */
export function useMaintenanceNoteForm(patientUuid: string, maintenanceNumber: MaintenanceNumber) {
  const { executeCreateMaintenanceNote, isPending } = useCreateMaintenanceNoteMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [hasError, setHasError] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  // El campo crece con el texto: parte de las filas mínimas y se detiene en NOTE_MAX_ROWS.
  useLayoutEffect(() => {
    const element = fieldRef.current;
    if (!element) return;
    element.style.height = 'auto';
    const style = window.getComputedStyle(element);
    const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const maxHeight = (parseFloat(style.lineHeight) || 20) * NOTE_MAX_ROWS + padding + borders;
    element.style.height = `${Math.min(element.scrollHeight + borders, maxHeight)}px`;
  }, [draft, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasError(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setDraft('');
    setHasError(false);
  };

  const handleChange = (value: string) => {
    setDraft(value.slice(0, MAINTENANCE_NOTE_MAX_LENGTH));
    setHasError(false);
  };

  const text = draft.trim();

  const handleSave = () => {
    if (!text || isPending) return;
    executeCreateMaintenanceNote(
      { patientUuid, maintenanceNumber, text },
      {
        onSuccess: () => {
          setIsOpen(false);
          setDraft('');
        },
        onError: () => setHasError(true),
      },
    );
  };

  return {
    isOpen,
    draft,
    fieldRef,
    hasError,
    isSaving: isPending,
    canSave: text.length > 0,
    handleOpen,
    handleCancel,
    handleChange,
    handleSave,
  };
}
