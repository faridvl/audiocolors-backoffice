import { useTranslation } from 'react-i18next';
import { useSession } from '@/hooks/use-session';
import { formatProfessionalName } from '@/shared/utils/professional-name';
import { TEXT } from '@/static/texts/i18n';

/** El nombre del usuario de la sesión como sale en los documentos (título, nombre y colegiado). */
export function useProfessionalSignatureName(): string {
  const { t } = useTranslation();
  const { user } = useSession();

  return formatProfessionalName({
    title: user?.professionalTitle ? t(TEXT.SETTINGS.USERS.TITLES[user.professionalTitle]) : null,
    fullName: user?.fullName ?? '',
    licenseNumber: user?.licenseNumber,
    licensePrefix: t(TEXT.DOCUMENT_TEMPLATES.LICENSE_PREFIX),
  });
}
