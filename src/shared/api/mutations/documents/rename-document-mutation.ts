import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientDocument } from '@/types/documents/document.types';

interface RenameDocumentVariables {
  patientUuid: string;
  documentUuid: string;
  originalName: string;
}

export function useRenameDocumentMutation() {
  const { mutate: executeRenameDocument, isPending } = useApiMutation<
    PatientDocument,
    RenameDocumentVariables
  >({
    mutationKey: ['renameDocument'],
    mutationFn: ({ patientUuid, documentUuid, originalName }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<PatientDocument>(
        `/patients/${patientUuid}/documents/${documentUuid}`,
        { originalName },
      ),
  });

  return { executeRenameDocument, isPending };
}
