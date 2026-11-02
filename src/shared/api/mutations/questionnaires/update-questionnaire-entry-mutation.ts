import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  QuestionnaireEntry,
  UpdateQuestionnaireEntryPayload,
} from '@/types/questionnaires/questionnaire-entry';

interface UpdateQuestionnaireEntryVariables {
  patientUuid: string;
  entryUuid: string;
  changes: UpdateQuestionnaireEntryPayload;
}

export function useUpdateQuestionnaireEntryMutation() {
  const { mutate: executeUpdateEntry, isPending } = useApiMutation<
    QuestionnaireEntry,
    UpdateQuestionnaireEntryVariables
  >({
    mutationKey: ['updateQuestionnaireEntry'],
    mutationFn: ({ patientUuid, entryUuid, changes }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<QuestionnaireEntry>(
        `/patients/${patientUuid}/questionnaire-entries/${entryUuid}`,
        changes,
      ),
  });

  return { executeUpdateEntry, isPending };
}
