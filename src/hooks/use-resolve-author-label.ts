import { useSession } from '@/hooks/use-session';

/**
 * Nombre de quien creó un registro (nota, documento, etc.).
 *
 * El API no devuelve el nombre del autor, solo su uuid. No existe en el
 * proyecto un query que resuelva uuid de usuario -> nombre (no hay lista de
 * usuarios del tenant, solo `useSession` con el usuario actual). Por eso solo
 * se puede reconocer al autor cuando coincide con el usuario logueado; para
 * el resto se usa un texto generico en vez de inventar un endpoint nuevo.
 */
export function useResolveAuthorLabel() {
  const { user } = useSession();

  return (authorUuid: string) => {
    if (user?.uuid && authorUuid === user.uuid) return user.fullName;
    return 'Registrado por el equipo médico';
  };
}
