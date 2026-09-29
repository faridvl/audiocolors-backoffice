import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { DocumentCategory, PatientDocument } from '@/types/documents/document.types';

export interface UploadDocumentPayload {
  patientUuid: string;
  file: File;
  category: DocumentCategory;
  /**
   * Nombre con el que se guarda el archivo. El API toma el nombre del
   * multipart (`file.originalname`), así que basta con mandarlo acá.
   */
  fileName?: string;
}

/**
 * No usa ApiServiceClient: con FormData el navegador debe fijar el
 * Content-Type con su propio boundary multipart.
 */
async function uploadDocument(payload: UploadDocumentPayload): Promise<PatientDocument> {
  const token = CookiesManager.getAccessToken();
  const formData = new FormData();
  formData.append('file', payload.file, payload.fileName ?? payload.file.name);
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

  const document = (await response.json()) as PatientDocument;
  const expectedName = payload.fileName ?? payload.file.name;

  // El API lee el nombre del multipart como latin1: "Audiometría" llega como
  // "AudiometrÃ­a". El renombrado va por JSON y sí conserva UTF-8, así que se
  // corrige apenas se sube. Si falla, el archivo ya quedó guardado y se puede
  // renombrar a mano.
  if (document.originalName === expectedName) return document;

  try {
    return await ApiServiceClient(env.API.MEDICAL_RECORDS_URL).patch<PatientDocument>(
      `/patients/${payload.patientUuid}/documents/${document.uuid}`,
      { originalName: expectedName },
    );
  } catch {
    return document;
  }
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
