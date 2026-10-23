import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import {
  ClinicalTemplate,
  SaveClinicalTemplatePayload,
} from '@/types/clinical-templates/clinical-template';

interface SaveClinicalHistoryTemplateVariables {
  /** UUID de la plantilla si ya existe; sin él se crea. */
  templateUuid: string | null;
  template: SaveClinicalTemplatePayload;
}

export function useSaveClinicalHistoryTemplateMutation() {
  const { mutate: executeSaveTemplate, isPending } = useApiMutation<
    ClinicalTemplate,
    SaveClinicalHistoryTemplateVariables
  >({
    mutationKey: ['saveClinicalHistoryTemplate'],
    mutationFn: ({ templateUuid, template }) => {
      const client = ApiServiceClient(env.API.MEDICAL_RECORDS_URL);
      return templateUuid
        ? client.patch<ClinicalTemplate>(`/clinical-templates/${templateUuid}`, {
            fields: template.fields,
          })
        : client.post<ClinicalTemplate>('/clinical-templates', template);
    },
  });

  return { executeSaveTemplate, isPending };
}
