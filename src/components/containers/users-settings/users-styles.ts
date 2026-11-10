import { UserStatus } from '@/types/users/user';

export const USER_STATUS_CLASSES: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'bg-success/10 text-success',
  [UserStatus.INACTIVE]: 'bg-ink-200 text-ink-700',
};
