import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { routesPublic } from '@/shared/navigation/routes';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    CookiesManager.clearAll();
    queryClient.clear();
    void router.replace(routesPublic.login);
  };
}
