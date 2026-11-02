import { useCallback, useMemo, useRef, useState } from 'react';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { useCreateOtoscopyEntryMutation } from '@/shared/api/mutations/otoscopy/create-otoscopy-entry-mutation';
import { useUpdateOtoscopyEntryMutation } from '@/shared/api/mutations/otoscopy/update-otoscopy-entry-mutation';
import { OtoscopyEntry } from '@/types/patients/otoscopy-entry';

export interface OtoscopyFormValues {
  otoscopyRight: string;
  otoscopyLeft: string;
}

const toNullableText = (value: string) => value.trim() || null;

interface UseOtoscopyEntryFormOptions {
  patientUuid: string;
  /** Con un registro, el formulario lo corrige en vez de crear uno nuevo. */
  entry?: OtoscopyEntry;
  onDone: () => void;
  /** Se llama al guardar bien, antes de `onDone`. */
  onSaved?: () => void;
}

export function useOtoscopyEntryForm({
  patientUuid,
  entry,
  onDone,
  onSaved,
}: UseOtoscopyEntryFormOptions) {
  const { executeCreateEntry, isPending: isCreatePending } = useCreateOtoscopyEntryMutation();
  const { executeUpdateEntry, isPending: isUpdatePending } = useUpdateOtoscopyEntryMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  // Mensaje del API cuando el registro ya no se puede corregir; el formulario sigue abierto con lo escrito.
  const [staleMessage, setStaleMessage] = useState<string | null>(null);
  // El ref corta el segundo clic del mismo instante, antes de que el estado se repinte.
  const savingRef = useRef(false);

  const initialValues = useMemo<OtoscopyFormValues>(
    () => ({
      otoscopyRight: entry?.otoscopyRight ?? '',
      otoscopyLeft: entry?.otoscopyLeft ?? '',
    }),
    [entry],
  );

  const releaseSaving = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const clearEmptyError = useCallback(() => setIsEmpty(false), []);

  const save = (values: OtoscopyFormValues, asNew: boolean) => {
    if (savingRef.current) return;
    const payload = {
      otoscopyRight: toNullableText(values.otoscopyRight),
      otoscopyLeft: toNullableText(values.otoscopyLeft),
    };
    if (!payload.otoscopyRight && !payload.otoscopyLeft) {
      setIsEmpty(true);
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    const isUpdating = !!entry && !asNew;
    // Los avisos y el refresco los hace la mutation; aquí solo lo propio del formulario.
    const handleSuccess = () => {
      releaseSaving();
      onSaved?.();
      onDone();
    };
    const handleError = (error: Error) => {
      releaseSaving();
      if (!(error instanceof ApiError)) return;
      // Ya no se corrige (cambió el día): se queda lo escrito para guardarlo como registro nuevo.
      if (isUpdating && error.status === HttpStatus.CONFLICT) {
        setStaleMessage(error.message);
        return;
      }
      // El registro ya no existe, o el usuario perdió el acceso: no hay nada que seguir editando.
      if (
        (isUpdating && error.status === HttpStatus.NOT_FOUND) ||
        error.status === HttpStatus.FORBIDDEN
      ) {
        onDone();
      }
    };

    if (entry && !asNew) {
      executeUpdateEntry(
        { patientUuid, entryUuid: entry.uuid, changes: payload },
        { onSuccess: handleSuccess, onError: handleError },
      );
      return;
    }
    executeCreateEntry(
      { patientUuid, entry: payload },
      { onSuccess: handleSuccess, onError: handleError },
    );
  };

  return {
    initialValues,
    isEditing: !!entry,
    isPending: isCreatePending || isUpdatePending || isSaving,
    isEmpty,
    staleMessage,
    clearEmptyError,
    handleSubmit: (values: OtoscopyFormValues) => save(values, false),
    handleSaveAsNew: (values: OtoscopyFormValues) => save(values, true),
  };
}
