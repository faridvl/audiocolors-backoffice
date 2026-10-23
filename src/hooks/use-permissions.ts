import { hasPermission, Permission } from '@/shared/auth/permissions';
import { useSession } from './use-session';

export function usePermissions() {
  const { user, isLoading } = useSession();

  return {
    can: (permission: Permission) => hasPermission(user?.role, permission),
    isLoading: isLoading || !user,
  };
}
