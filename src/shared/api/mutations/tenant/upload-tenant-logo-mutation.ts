import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { env } from '@/shared/api/config';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { Tenant } from '@/types/tenant/tenant';

const GENERIC_UPLOAD_ERROR = 'No se pudo subir el logo.';

/**
 * No usa ApiServiceClient: con FormData el navegador debe fijar el
 * Content-Type con su propio boundary multipart.
 */
async function uploadTenantLogo(file: File): Promise<Tenant> {
  const token = CookiesManager.getAccessToken();
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch(`${env.API.IDENTITY_URL}/tenants/current/logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    let message = GENERIC_UPLOAD_ERROR;

    try {
      const parsed = (await response.json()) as { message?: string | string[] };
      if (parsed.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join('. ') : parsed.message;
      }
    } catch {
      // Cuerpo no-JSON (por ejemplo un 500 de infraestructura): se deja el
      // mensaje genérico en vez de mostrar HTML crudo.
    }

    throw new Error(message);
  }

  return (await response.json()) as Tenant;
}

export function useUploadTenantLogoMutation() {
  const { mutate: executeUploadTenantLogo, isPending } = useApiMutation<Tenant, File>({
    mutationKey: ['uploadTenantLogo'],
    mutationFn: uploadTenantLogo,
  });

  return { executeUploadTenantLogo, isPending };
}
