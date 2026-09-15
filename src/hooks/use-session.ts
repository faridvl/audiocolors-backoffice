import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { UserSessionResponse } from '@/types/auth/auth';

export const SESSION_QUERY_KEY = 'authMe';

export function useSession() {
  const token = CookiesManager.getAccessToken();

  const { data, isLoading, isError } = useQuery({
    queryKey: [SESSION_QUERY_KEY],
    queryFn: () => ApiServiceClient(env.API.IDENTITY_URL).get<UserSessionResponse>('/auth/me'),
    enabled: !!token,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  return {
    user: data?.user,
    tenant: data?.tenant,
    isLoading,
    isError,
    isAuthenticated: !!token && !!data?.user,
  };
}
