import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import {
  DocumentTemplate,
  SaveDocumentTemplatePayload,
} from '@/types/document-templates/document-template';

interface SaveDocumentTemplateVariables {
  /** UUID de la plantilla si ya existe; sin él se crea. */
  templateUuid: string | null;
  template: SaveDocumentTemplatePayload;
}

export function useSaveDocumentTemplateMutation() {
  const { mutate: executeSaveDocumentTemplate, isPending } = useApiMutation<
    DocumentTemplate,
    SaveDocumentTemplateVariables
  >({
    mutationKey: ['saveDocumentTemplate'],
    mutationFn: ({ templateUuid, template }) => {
      const client = ApiServiceClient(env.API.MEDICAL_RECORDS_URL);
      return templateUuid
        ? client.put<DocumentTemplate>(`/document-templates/${templateUuid}`, template)
        : client.post<DocumentTemplate>('/document-templates', template);
    },
  });

  return { executeSaveDocumentTemplate, isPending };
}
