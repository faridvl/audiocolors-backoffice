import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  CreateQuestionnaireEntryPayload,
  QuestionnaireEntry,
} from '@/types/questionnaires/questionnaire-entry';

interface CreateQuestionnaireEntryVariables {
  patientUuid: string;
  entry: CreateQuestionnaireEntryPayload;
}

export function useCreateQuestionnaireEntryMutation() {
  const { mutate: executeCreateEntry, isPending } = useApiMutation<
    QuestionnaireEntry,
    CreateQuestionnaireEntryVariables
  >({
    mutationKey: ['createQuestionnaireEntry'],
    mutationFn: ({ patientUuid, entry }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).post<QuestionnaireEntry>(
        `/patients/${patientUuid}/questionnaire-entries`,
        entry,
      ),
  });

  return { executeCreateEntry, isPending };
}
