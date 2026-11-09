import { KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCreateMaintenanceNoteMutation } from "@/shared/api/mutations/patients/create-maintenance-note-mutation";
import {
  MAINTENANCE_NOTE_MAX_LENGTH,
  MaintenanceNumber,
} from "@/types/patients/patient";
import { MissedFlow, MissedSaveResult } from "./use-patient-maintenance";

/** Filas máximas del campo antes de que aparezca el scroll interno. */
const NOTE_MAX_ROWS = 8;

/**
 * Redacta una nota nueva de un mantenimiento. El texto vive en `draft` hasta que el guardado
 * se confirma: si falla, el campo conserva lo escrito.
 */
export function useMaintenanceNoteForm(
  patientUuid: string,
  maintenanceNumber: MaintenanceNumber,
  missedFlow: MissedFlow | null = null,
) {
  const { executeCreateMaintenanceNote, isPending } =
    useCreateMaintenanceNoteMutation();
  const [draft, setDraft] = useState("");
  const [hasError, setHasError] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const isMissedPending = missedFlow !== null;
  const hasStatusError = missedFlow?.hasStatusError ?? false;
  const isSaving = isPending || (missedFlow?.isSaving ?? false);

  // El campo crece con el texto: parte de las filas mínimas y se detiene en NOTE_MAX_ROWS.
  useLayoutEffect(() => {
    const element = fieldRef.current;
    if (!element) return;
    element.style.height = "auto";
    const style = window.getComputedStyle(element);
    const borders =
      parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const maxHeight =
      (parseFloat(style.lineHeight) || 20) * NOTE_MAX_ROWS + padding + borders;
    element.style.height = `${Math.min(element.scrollHeight + borders, maxHeight)}px`;
  }, [draft]);

  // Al marcar "Lo perdió" el cursor queda listo para escribir la nota.
  useEffect(() => {
    if (isMissedPending) fieldRef.current?.focus();
  }, [isMissedPending]);

  const handleChange = (value: string) => {
    setDraft(value.slice(0, MAINTENANCE_NOTE_MAX_LENGTH));
    setHasError(false);
  };

  const text = draft.trim();

  // En "Lo perdió" la nota y el estado los guarda el hook de la lista, que sigue vivo si
  // el formulario se cierra; aquí solo se refleja el resultado.
  const handleMissedSave = async (flow: MissedFlow) => {
    const result = await flow.onSaveNote(text);
    if (result === MissedSaveResult.NOTE_FAILED) {
      setHasError(true);
      return;
    }
    setDraft("");
  };

  const handleSave = () => {
    if (!text || isSaving || hasStatusError) return;
    if (missedFlow) {
      void handleMissedSave(missedFlow);
      return;
    }
    executeCreateMaintenanceNote(
      { patientUuid, maintenanceNumber, text },
      {
        onSuccess: () => setDraft(""),
        onError: () => setHasError(true),
      },
    );
  };

  // Enter guarda y Shift+Enter hace salto de línea; no se corta una composición (IME).
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    handleSave();
  };

  return {
    draft,
    fieldRef,
    hasError,
    isSaving,
    hasStatusError,
    canSave: text.length > 0 && !hasStatusError,
    handleChange,
    handleKeyDown,
    handleSave,
  };
}
