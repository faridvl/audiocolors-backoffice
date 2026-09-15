import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { env } from '@/shared/api/config';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { DocumentCategory, PatientDocument } from '@/types/documents/document.types';

export interface UploadDocumentPayload {
  patientUuid: string;
  file: File;
  category: DocumentCategory;
}

/**
 * No usa ApiServiceClient: con FormData el navegador debe fijar el
 * Content-Type con su propio boundary multipart.
 */
async function uploadDocument(payload: UploadDocumentPayload): Promise<PatientDocument> {
  const token = CookiesManager.getAccessToken();
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('category', payload.category);

  const response = await fetch(
    `${env.API.MEDICAL_RECORDS_URL}/patients/${payload.patientUuid}/documents`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );

  if (!response.ok) {
    const rawBody = await response.text();
    let message = 'No se pudo subir el archivo.';

    try {
      const parsed = JSON.parse(rawBody) as { message?: string | string[] };
      if (parsed.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join('. ') : parsed.message;
      }
    } catch {
      // Cuerpo no-JSON (por ejemplo un 500 de infraestructura): se mantiene
      // el mensaje generico en vez de mostrar HTML crudo al usuario.
    }

    if (response.status === 500) {
      message = 'El servidor no pudo guardar el archivo. Avisa al administrador.';
    }

    throw new Error(message);
  }

  return (await response.json()) as PatientDocument;
}

export function useUploadDocumentMutation() {
  const { mutate: executeUploadDocument, isPending } = useApiMutation<
    PatientDocument,
    UploadDocumentPayload
  >({
    mutationKey: ['uploadDocument'],
    mutationFn: uploadDocument,
  });

  return { executeUploadDocument, isPending };
}
