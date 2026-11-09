import { useCallback, useRef, useState } from 'react';
import { useCreateOtoscopyEntryMutation } from '@/shared/api/mutations/otoscopy/create-otoscopy-entry-mutation';

export interface OtoscopyFormValues {
  otoscopyRight: string;
  otoscopyLeft: string;
}

const toNullableText = (value: string) => value.trim() || null;

interface UseOtoscopyEntryFormOptions {
  patientUuid: string;
}

export function useOtoscopyEntryForm({ patientUuid }: UseOtoscopyEntryFormOptions) {
  const { executeCreateEntry, isPending: isCreatePending } = useCreateOtoscopyEntryMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  // El ref corta el segundo clic del mismo instante, antes de que el estado se repinte.
  const savingRef = useRef(false);

  const releaseSaving = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const clearEmptyError = useCallback(() => setIsEmpty(false), []);

  // Los avisos y el refresco los hace la mutation; aquí solo lo propio del formulario.
  const handleSubmit = (values: OtoscopyFormValues, onSaved: () => void) => {
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
    executeCreateEntry(
      { patientUuid, entry: payload },
      {
        onSuccess: () => {
          releaseSaving();
          onSaved();
        },
        onError: releaseSaving,
      },
    );
  };

  return {
    isPending: isCreatePending || isSaving,
    isEmpty,
    clearEmptyError,
    handleSubmit,
  };
}
