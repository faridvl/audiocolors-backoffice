import { useSession } from '@/hooks/use-session';

/** Nombre de quien creó un registro; si el API no lo resolvió, cae al usuario logueado o a un texto genérico. */
export function useResolveAuthorLabel() {
  const { user } = useSession();

  return (authorUuid: string, authorName?: string | null) => {
    if (authorName) return authorName;
    if (user?.uuid && authorUuid === user.uuid) return user.fullName;
    return 'el equipo médico';
  };
}
