import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';

interface DeleteDocumentVariables {
  patientUuid: string;
  documentUuid: string;
}

export function useDeleteDocumentMutation() {
  const { mutate: executeDeleteDocument, isPending } = useApiMutation<
    null,
    DeleteDocumentVariables
  >({
    mutationKey: ['deleteDocument'],
    mutationFn: ({ patientUuid, documentUuid }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).delete<null>(
        `/patients/${patientUuid}/documents/${documentUuid}`,
      ),
  });

  return { executeDeleteDocument, isPending };
}
