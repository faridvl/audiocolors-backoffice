import { UserRole } from '../../../types/auth/auth';
import { ManagedUser, UserStatus } from '../../../types/users/user';

const SORT_LOCALE = 'es';

/** Activos primero; dentro de cada grupo, por nombre. */
export function sortUsers(users: ManagedUser[]): ManagedUser[] {
  const statusRank = (user: ManagedUser) => (user.status === UserStatus.ACTIVE ? 0 : 1);
  return [...users].sort(
    (a, b) => statusRank(a) - statusRank(b) || a.fullName.localeCompare(b.fullName, SORT_LOCALE),
  );
}

export interface UserActions {
  canChangeRole: boolean;
  canToggleStatus: boolean;
}

function isLastActiveOwner(user: ManagedUser, users: ManagedUser[]): boolean {
  if (user.role !== UserRole.OWNER || user.status !== UserStatus.ACTIVE) return false;
  return (
    users.filter((item) => item.role === UserRole.OWNER && item.status === UserStatus.ACTIVE)
      .length <= 1
  );
}

/** Lo que el OWNER puede hacer con un usuario; el API repite estas reglas. */
export function getUserActions(
  user: ManagedUser,
  users: ManagedUser[],
  currentUserUuid: string | undefined,
): UserActions {
  const isSelf = user.uuid === currentUserUuid;
  const isLastOwner = isLastActiveOwner(user, users);
  return {
    canChangeRole: !isSelf && !isLastOwner,
    canToggleStatus: !isSelf && !isLastOwner,
  };
}
