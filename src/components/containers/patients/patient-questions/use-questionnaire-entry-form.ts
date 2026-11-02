import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  buildAnswers,
  buildFormValues,
  ClinicalHistoryFormValues,
} from '@/components/containers/patients/patient-background/clinical-history';
import { useCreateQuestionnaireEntryMutation } from '@/shared/api/mutations/questionnaires/create-questionnaire-entry-mutation';
import { FETCH_QUESTIONNAIRE_ENTRIES_KEY } from '@/shared/api/querys/questionnaire-entries-query';
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

  // Cada registro parte vacío, con las preguntas que la clínica tiene hoy.
  const initialValues = useMemo(() => buildFormValues(template.fields, {}), [template.fields]);

  const handleSubmit = (values: ClinicalHistoryFormValues) => {
    executeCreateEntry(
      {
        patientUuid,
        entry: {
          templateUuid: template.uuid,
          answers: buildAnswers(template.fields, values),
        },
      },
      {
        onSuccess: () => {
          toast.success(t(TEXT.QUESTIONS.ENTRY_SAVED));
          void queryClient.invalidateQueries({
            queryKey: [FETCH_QUESTIONNAIRE_ENTRIES_KEY, patientUuid],
          });
          onDone();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return { initialValues, isPending, handleSubmit };
}
