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
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_QUESTIONNAIRE_ENTRIES_KEY } from '@/shared/api/querys/questionnaire-entries-query';
import { FETCH_QUESTIONNAIRE_TEMPLATES_KEY } from '@/shared/api/querys/questionnaire-templates-query';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplate } from '@/types/clinical-templates/clinical-template';

interface UseQuestionnaireEntryFormOptions {
  patientUuid: string;
  template: ClinicalTemplate;
  onDone: () => void;
}

export function useQuestionnaireEntryForm({
  patientUuid,
  template,
  onDone,
}: UseQuestionnaireEntryFormOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeCreateEntry, isPending } = useCreateQuestionnaireEntryMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  // El ref corta el segundo clic del mismo instante, antes de que el estado se repinte.
  const savingRef = useRef(false);

  // Cada registro parte vacío, con las preguntas que la clínica tiene hoy.
  const initialValues = useMemo(() => buildFormValues(template.fields, {}), [template.fields]);

  const releaseSaving = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const clearEmptyError = useCallback(() => setIsEmpty(false), []);

  const handleSubmit = (values: ClinicalHistoryFormValues) => {
    if (savingRef.current) return;
    const answers = buildAnswers(template.fields, values);
    if (!hasAnswerContent(answers)) {
      setIsEmpty(true);
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    executeCreateEntry(
      { patientUuid, entry: { templateUuid: template.uuid, answers } },
      {
        onSuccess: () => {
          toast.success(t(TEXT.QUESTIONS.ENTRY_SAVED));
          void queryClient.invalidateQueries({
            queryKey: [FETCH_QUESTIONNAIRE_ENTRIES_KEY, patientUuid],
          });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
          releaseSaving();
          onDone();
        },
        onError: (error: Error) => {
          toast.error(error.message);
          // Si las preguntas cambiaron mientras se llenaba, se vuelve a pedir la plantilla vigente.
          if (error instanceof ApiError && error.status === HttpStatus.BAD_REQUEST) {
            void queryClient.invalidateQueries({ queryKey: [FETCH_QUESTIONNAIRE_TEMPLATES_KEY] });
          }
          releaseSaving();
        },
      },
    );
  };

  return {
    initialValues,
    isPending: isPending || isSaving,
    isEmpty,
    clearEmptyError,
    handleSubmit,
  };
}
