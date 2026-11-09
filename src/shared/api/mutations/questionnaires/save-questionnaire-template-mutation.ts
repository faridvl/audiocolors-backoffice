import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  ClinicalField,
  ClinicalTemplate,
  QUESTIONNAIRE_SPECIALITY,
} from '@/types/clinical-templates/clinical-template';

interface SaveQuestionnaireTemplateVariables {
  /** UUID de la sección si ya existe; sin él se crea. */
  templateUuid: string | null;
  name: string;
  fields: ClinicalField[];
}

export function useSaveQuestionnaireTemplateMutation() {
  const { mutate: executeSaveTemplate, isPending } = useApiMutation<
    ClinicalTemplate,
    SaveQuestionnaireTemplateVariables
  >({
    mutationKey: ['saveQuestionnaireTemplate'],
    mutationFn: ({ templateUuid, name, fields }) => {
      const client = ApiServiceClient(env.API.MEDICAL_RECORDS_URL);
      return templateUuid
        ? client.patch<ClinicalTemplate>(`/clinical-templates/${templateUuid}`, { name, fields })
        : client.post<ClinicalTemplate>('/clinical-templates', {
            name,
            speciality: QUESTIONNAIRE_SPECIALITY,
            fields,
          });
    },
  });

  return { executeSaveTemplate, isPending };
}
