import { ClinicalSpecialty, UserRole } from '../../../types/auth/auth';
import {
  ASSIGNABLE_USER_ROLES,
  ManagedUser,
  OWNER_ASSIGNABLE_USER_ROLES,
  USER_PASSWORD_MAX_LENGTH,
  UserStatus,
} from '../../../types/users/user';

const SORT_LOCALE = 'es';

/** bcrypt ignora lo que pase de 72 bytes UTF-8, así que el tope se mide en bytes. */
export function isPasswordWithinByteLimit(password: string): boolean {
  return new TextEncoder().encode(password).length <= USER_PASSWORD_MAX_LENGTH;
}

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

/** Niveles que el actor puede dar: el ADMIN, Recepción y Administración; el OWNER, además Propietario. */
export function getAssignableRoles(actorRole: UserRole | null | undefined): UserRole[] {
  return actorRole === UserRole.OWNER ? OWNER_ASSIGNABLE_USER_ROLES : ASSIGNABLE_USER_ROLES;
}

/**
 * Lo que el actor (OWNER o ADMIN) puede hacer con un usuario; el API repite estas reglas.
 * Un OWNER ajeno es administrable solo por otro OWNER; para el resto de actores (o sin actor) se ve
 * de solo lectura. El propio usuario edita sus datos, sin nivel ni estado.
 */
export function getUserActions(
  user: ManagedUser,
  currentUserUuid: string | undefined,
  actorRole: UserRole | null | undefined,
): UserActions {
  const isSelf = user.uuid === currentUserUuid;
  const isLockedOwner = user.role === UserRole.OWNER && !isSelf && actorRole !== UserRole.OWNER;
  return {
    canEdit: !isLockedOwner,
    canSetPassword: !isLockedOwner,
    canChangeRole: !isLockedOwner && !isSelf,
    canToggleStatus: !isLockedOwner && !isSelf,
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

export function isAssignableRole(
  role: string | null,
  assignable: UserRole[] = ASSIGNABLE_USER_ROLES,
): role is UserRole {
  return assignable.includes(role as UserRole);
}

/** Opciones del selector: las asignables y, si es otro nivel conocido, el actual, para que la ficha lo muestre elegido. */
export function getSelectableRoles(
  assignable: UserRole[],
  currentRole: string | null | undefined,
): UserRole[] {
  if (!currentRole || !isKnownRole(currentRole) || assignable.includes(currentRole)) {
    return assignable;
  }
  return [...assignable, currentRole];
}

/** Valor inicial del selector: solo un rol asignable se preselecciona; el resto queda sin elegir. */
export function getInitialRoleSelection(
  role: string | null,
  assignable: UserRole[] = ASSIGNABLE_USER_ROLES,
): UserRole | '' {
  return isAssignableRole(role, assignable) ? role : '';
}

/** El rol viaja en el PATCH solo si la persona eligió uno distinto del actual. */
export function getRoleChange(
  selected: string,
  current: string | null,
  assignable: UserRole[] = ASSIGNABLE_USER_ROLES,
): UserRole | undefined {
  if (!isAssignableRole(selected, assignable) || selected === current) return undefined;
  return selected;
}

/** Mismas especialidades, sin importar el orden. */
export function sameSpecialties(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',');
}

export interface ClinicalAccessValues {
  attendsPatients: boolean;
  specialties: string[];
}

/** Solo el propietario cambia si atiende pacientes; sin cambios no se manda nada (el API da 403 al ADMIN). */
export function getClinicalAccessChange(
  values: ClinicalAccessValues,
  current: Pick<ManagedUser, 'attendsPatients' | 'specialties'> | null,
): { attendsPatients: boolean; specialties: ClinicalSpecialty[] } | undefined {
  const specialties = values.attendsPatients ? (values.specialties as ClinicalSpecialty[]) : [];
  if (
    current &&
    current.attendsPatients === values.attendsPatients &&
    sameSpecialties(current.specialties, specialties)
  ) {
    return undefined;
  }
  return { attendsPatients: values.attendsPatients, specialties };
}
