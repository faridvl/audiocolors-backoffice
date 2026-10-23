import { useQuery } from '@tanstack/react-query';
import { ApiError, ApiServiceClient, HttpStatus } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  CLINICAL_HISTORY_SPECIALITY,
  ClinicalTemplate,
} from '@/types/clinical-templates/clinical-template';

export const FETCH_CLINICAL_HISTORY_TEMPLATE_KEY = 'fetchClinicalHistoryTemplate';

/**
 * Las preguntas de la historia clínica de la clínica. `null` si el
 * administrador todavía no las cambió: el API responde 404 y se usa la lista
 * estándar.
 */
export function useClinicalHistoryTemplateQuery() {
  return useQuery({
    queryKey: [FETCH_CLINICAL_HISTORY_TEMPLATE_KEY],
    queryFn: async () => {
      try {
        return await ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<ClinicalTemplate>(
          `/clinical-templates/speciality/${CLINICAL_HISTORY_SPECIALITY}`,
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === HttpStatus.NOT_FOUND) return null;
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}
