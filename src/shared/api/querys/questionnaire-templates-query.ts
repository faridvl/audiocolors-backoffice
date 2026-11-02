import { useQuery } from '@tanstack/react-query';
import { ApiError, ApiServiceClient, HttpStatus } from '@/shared/api/api-service-client';
import { isForbiddenError } from '@/shared/api/querys/patient-background-query';
import { env } from '@/shared/api/config';
import {
  ClinicalTemplate,
  QUESTIONNAIRE_SPECIALITY,
} from '@/types/clinical-templates/clinical-template';

export const FETCH_QUESTIONNAIRE_TEMPLATES_KEY = 'fetchQuestionnaireTemplates';

/** Las secciones propias de Preguntas, en orden de creación. */
export function useQuestionnaireTemplatesQuery() {
  return useQuery({
    queryKey: [FETCH_QUESTIONNAIRE_TEMPLATES_KEY],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<ClinicalTemplate[]>(
        `/clinical-templates/speciality/${QUESTIONNAIRE_SPECIALITY}/all`,
      ),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) =>
      !isForbiddenError(error) &&
      !(error instanceof ApiError && error.status === HttpStatus.NOT_FOUND) &&
      failureCount < 3,
  });
}
