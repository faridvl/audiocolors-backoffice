import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { useCreateOtoscopyEntryMutation } from '@/shared/api/mutations/otoscopy/create-otoscopy-entry-mutation';
import { useUpdateOtoscopyEntryMutation } from '@/shared/api/mutations/otoscopy/update-otoscopy-entry-mutation';
import { FETCH_OTOSCOPY_ENTRIES_KEY } from '@/shared/api/querys/otoscopy-entries-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { TEXT } from '@/static/texts/i18n';
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
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
    const refreshEntries = () =>
      void queryClient.invalidateQueries({ queryKey: [FETCH_OTOSCOPY_ENTRIES_KEY, patientUuid] });
    const isUpdating = !!entry && !asNew;
    const handleSuccess = () => {
      toast.success(
        t(
          isUpdating
            ? TEXT.PATIENTS.PHYSICAL_EXAM.CORRECTED_SAVED
            : TEXT.PATIENTS.PHYSICAL_EXAM.SAVED,
        ),
      );
      refreshEntries();
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
      releaseSaving();
      onSaved?.();
      onDone();
    };
    const handleError = (error: Error) => {
      const isStale =
        isUpdating && error instanceof ApiError && error.status === HttpStatus.CONFLICT;
      // En el conflicto el mensaje ya queda a la vista en el formulario: el aviso sería repetirlo.
      if (!isStale) toast.error(error.message);
      if (error instanceof ApiError) {
        // Ya no se corrige (cambió el día): se queda lo escrito para guardarlo como registro nuevo.
        if (isStale) {
          refreshEntries();
          setStaleMessage(error.message);
          releaseSaving();
          return;
        }
        // El registro ya no existe: se cierra y se muestra como quedó.
        if (isUpdating && error.status === HttpStatus.NOT_FOUND) {
          refreshEntries();
          releaseSaving();
          onDone();
          return;
        }
      }
      releaseSaving();
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
