import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientDocument, UpdateDocumentPayload } from '@/types/documents/document.types';

interface UpdateDocumentVariables {
  patientUuid: string;
  documentUuid: string;
  changes: UpdateDocumentPayload;
}

export function useUpdateDocumentMutation() {
  const { mutate: executeUpdateDocument, isPending } = useApiMutation<
    PatientDocument,
    UpdateDocumentVariables
  >({
    mutationKey: ['updateDocument'],
    mutationFn: ({ patientUuid, documentUuid, changes }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<PatientDocument>(
        `/patients/${patientUuid}/documents/${documentUuid}`,
        changes,
      ),
  });

  return { executeUpdateDocument, isPending };
}
