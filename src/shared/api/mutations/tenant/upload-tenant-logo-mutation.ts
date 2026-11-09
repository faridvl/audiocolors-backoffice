import { useTranslation } from 'react-i18next';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { handleSessionExpired } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { TEXT } from '@/static/texts/i18n';
import { Tenant } from '@/types/tenant/tenant';

const HTTP_UNAUTHORIZED = 401;

interface UploadTenantLogoMessages {
  uploadError: string;
  networkError: string;
  sessionExpired: string;
}

/**
 * No usa ApiServiceClient: con FormData el navegador debe fijar el
 * Content-Type con su propio boundary multipart. Por eso repite aquí el manejo
 * de sesión vencida y de red caída del cliente.
 */
async function uploadTenantLogo(file: File, messages: UploadTenantLogoMessages): Promise<Tenant> {
  const token = CookiesManager.getAccessToken();
  const formData = new FormData();
  formData.append('file', file, file.name);

  let response: Response;

  try {
    response = await fetch(`${env.API.IDENTITY_URL}/tenants/current/logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  } catch {
    throw new Error(messages.networkError);
  }

  if (response.status === HTTP_UNAUTHORIZED && token) {
    handleSessionExpired();
    throw new Error(messages.sessionExpired);
  }

  if (!response.ok) {
    let message = messages.uploadError;

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
  const { t } = useTranslation();
  const { mutate: executeUploadTenantLogo, isPending } = useApiMutation<Tenant, File>({
    mutationKey: ['uploadTenantLogo'],
    mutationFn: (file) =>
      uploadTenantLogo(file, {
        uploadError: t(TEXT.SETTINGS.CLINIC.LOGO.ERROR_UPLOAD),
        networkError: t(TEXT.SETTINGS.CLINIC.LOGO.ERROR_NETWORK),
        sessionExpired: t(TEXT.SETTINGS.CLINIC.LOGO.ERROR_SESSION_EXPIRED),
      }),
  });

  return { executeUploadTenantLogo, isPending };
}
