import { UserRole } from '../../../types/auth/auth';
import { ASSIGNABLE_USER_ROLES, ManagedUser, UserStatus } from '../../../types/users/user';

const SORT_LOCALE = 'es';

/** Activos primero; dentro de cada grupo, por nombre. */
export function sortUsers(users: ManagedUser[]): ManagedUser[] {
  const statusRank = (user: ManagedUser) => (user.status === UserStatus.ACTIVE ? 0 : 1);
  return [...users].sort(
    (a, b) => statusRank(a) - statusRank(b) || a.fullName.localeCompare(b.fullName, SORT_LOCALE),
  );
}

export interface UserActions {
  canEdit: boolean;
  canSetPassword: boolean;
  canChangeRole: boolean;
  canToggleStatus: boolean;
}

/**
 * Lo que el OWNER puede hacer con un usuario; el API repite estas reglas.
 * Un OWNER ajeno se ve solo de lectura; el propio OWNER edita sus datos, sin rol ni estado.
 */
export function getUserActions(
  user: ManagedUser,
  currentUserUuid: string | undefined,
): UserActions {
  const isSelf = user.uuid === currentUserUuid;
  const isOtherOwner = user.role === UserRole.OWNER && !isSelf;
  return {
    canEdit: !isOtherOwner,
    canSetPassword: !isOtherOwner,
    canChangeRole: !isOtherOwner && !isSelf,
    canToggleStatus: !isOtherOwner && !isSelf,
  };
}

/** Un rol que la pantalla reconoce (incluye OWNER, que se ve pero no se asigna). */
export function isKnownRole(role: string | null): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/** USER, MEDICO o vacío: roles de antes de que los roles fueran fijos. */
export function isLegacyRole(role: string | null): boolean {
  return !isKnownRole(role);
}

export function isAssignableRole(role: string | null): role is UserRole {
  return ASSIGNABLE_USER_ROLES.includes(role as UserRole);
}

/** Valor inicial del selector: solo un rol asignable se preselecciona; el resto queda sin elegir. */
export function getInitialRoleSelection(role: string | null): UserRole | '' {
  return isAssignableRole(role) ? role : '';
}

/** El rol viaja en el PATCH solo si la persona eligió uno distinto del actual. */
export function getRoleChange(selected: string, current: string | null): UserRole | undefined {
  if (!isAssignableRole(selected) || selected === current) return undefined;
  return selected;
}
