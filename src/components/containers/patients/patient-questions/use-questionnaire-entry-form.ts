import { useCallback, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  buildAnswers,
  buildFormValues,
  ClinicalHistoryFormValues,
  hasAnswerContent,
} from '@/components/containers/patients/patient-background/clinical-history';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { useCreateQuestionnaireEntryMutation } from '@/shared/api/mutations/questionnaires/create-questionnaire-entry-mutation';
import { useUpdateQuestionnaireEntryMutation } from '@/shared/api/mutations/questionnaires/update-questionnaire-entry-mutation';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_QUESTIONNAIRE_ENTRIES_KEY } from '@/shared/api/querys/questionnaire-entries-query';
import { FETCH_QUESTIONNAIRE_TEMPLATES_KEY } from '@/shared/api/querys/questionnaire-templates-query';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplate } from '@/types/clinical-templates/clinical-template';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';

interface UseQuestionnaireEntryFormOptions {
  patientUuid: string;
  template: ClinicalTemplate;
  /** Con un registro, el formulario lo corrige en vez de crear uno nuevo. */
  entry?: QuestionnaireEntry;
  onDone: () => void;
}

export function useQuestionnaireEntryForm({
  patientUuid,
  template,
  entry,
  onDone,
}: UseQuestionnaireEntryFormOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeCreateEntry, isPending: isCreatePending } = useCreateQuestionnaireEntryMutation();
  const { executeUpdateEntry, isPending: isUpdatePending } = useUpdateQuestionnaireEntryMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  // Mensaje del API cuando el registro ya no se puede corregir; el formulario sigue abierto con lo escrito.
  const [staleMessage, setStaleMessage] = useState<string | null>(null);
  // El ref corta el segundo clic del mismo instante, antes de que el estado se repinte.
  const savingRef = useRef(false);

  // Un registro nuevo parte vacío, con las preguntas de hoy; al corregir, con las preguntas y
  // respuestas que el registro guardó (el API valida contra ellas, no contra la plantilla vigente).
  const fields = entry ? entry.templateSnapshot.fields : template.fields;
  const initialValues = useMemo(
    () => buildFormValues(fields, entry?.answers ?? {}),
    [fields, entry?.answers],
  );
  const isEditing = !!entry;

  const releaseSaving = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const clearEmptyError = useCallback(() => setIsEmpty(false), []);

  const save = (values: ClinicalHistoryFormValues, asNew: boolean) => {
    if (savingRef.current) return;
    const answers = buildAnswers(fields, values);
    if (!hasAnswerContent(answers)) {
      setIsEmpty(true);
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    const refreshEntries = () =>
      void queryClient.invalidateQueries({
        queryKey: [FETCH_QUESTIONNAIRE_ENTRIES_KEY, patientUuid],
      });
    const isUpdating = !!entry && !asNew;
    const handleSuccess = () => {
      toast.success(
        t(isUpdating ? TEXT.QUESTIONS.ENTRY_CORRECTED_SAVED : TEXT.QUESTIONS.ENTRY_SAVED),
      );
      refreshEntries();
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
      releaseSaving();
      onDone();
    };
    const handleError = (error: Error) => {
      toast.error(error.message);
      if (error instanceof ApiError) {
        // Si las preguntas cambiaron mientras se llenaba, se vuelve a pedir la plantilla vigente.
        if (error.status === HttpStatus.BAD_REQUEST) {
          void queryClient.invalidateQueries({ queryKey: [FETCH_QUESTIONNAIRE_TEMPLATES_KEY] });
        }
        // Ya no se corrige (cambió el día): se queda lo escrito para guardarlo como registro nuevo.
        if (isUpdating && error.status === HttpStatus.CONFLICT) {
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
        { patientUuid, entryUuid: entry.uuid, changes: { answers } },
        { onSuccess: handleSuccess, onError: handleError },
      );
      return;
    }
    executeCreateEntry(
      { patientUuid, entry: { templateUuid: template.uuid, answers } },
      { onSuccess: handleSuccess, onError: handleError },
    );
  };

  const handleSubmit = (values: ClinicalHistoryFormValues) => save(values, false);
  const handleSaveAsNew = (values: ClinicalHistoryFormValues) => save(values, true);

  return {
    initialValues,
    fields,
    isEditing,
    isPending: isCreatePending || isUpdatePending || isSaving,
    isEmpty,
    staleMessage,
    clearEmptyError,
    handleSubmit,
    handleSaveAsNew,
  };
}
