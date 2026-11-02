import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';

export const FETCH_QUESTIONNAIRE_ENTRIES_KEY = 'fetchQuestionnaireEntries';

/** Registros de las secciones propias del paciente, del más nuevo al más viejo. */
export function useQuestionnaireEntriesQuery(patientUuid: string, enabled = true) {
  return useQuery({
    queryKey: [FETCH_QUESTIONNAIRE_ENTRIES_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<QuestionnaireEntry[]>(
        `/patients/${patientUuid}/questionnaire-entries`,
      ),
    enabled: enabled && !!patientUuid,
  });
}
