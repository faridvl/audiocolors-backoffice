import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/use-permissions';
import { useSession } from '@/hooks/use-session';
import { useUsersQuery } from '@/shared/api/querys/users-query';
import { Permission } from '@/shared/auth/permissions';
import { formatProfessionalName } from '@/shared/utils/professional-name';
import { TEXT } from '@/static/texts/i18n';

/**
 * Nombre bajo la firma de un documento clínico: el de quien hizo el registro, con título y colegiado
 * si se conocen. Vacío si no se sabe quién fue, para que el documento use su respaldo.
 *
 * El API del registro solo trae el nombre; título y colegiado salen de la sesión (si fue quien
 * imprime) o de la lista de usuarios, que solo puede pedir quien administra usuarios.
 */
export function useAuthorSignatureName(
  authorUuid: string | null | undefined,
  authorName: string | null | undefined,
): string {
  const { t } = useTranslation();
  const { user } = useSession();
  const { can } = usePermissions();
  const isSessionUser = !!authorUuid && authorUuid === user?.uuid;
  const { data: users } = useUsersQuery({
    enabled: !!authorUuid && !isSessionUser && can(Permission.MANAGE_USERS),
  });

  const author = isSessionUser ? user : users?.find((candidate) => candidate.uuid === authorUuid);
  // Mismo criterio que la ficha del informe: sin nombre en el registro, solo se conoce a quien imprime.
  const fullName = authorName || (isSessionUser ? (user?.fullName ?? '') : '');
  if (!fullName) return '';

  return formatProfessionalName({
    title: author?.professionalTitle
      ? t(TEXT.SETTINGS.USERS.TITLES[author.professionalTitle])
      : null,
    fullName,
    licenseNumber: author?.licenseNumber,
    licensePrefix: t(TEXT.DOCUMENT_TEMPLATES.LICENSE_PREFIX),
  });
}
