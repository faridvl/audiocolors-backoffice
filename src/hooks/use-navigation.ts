import { useRouter } from 'next/router';
import { routesPrivate, routesPublic } from '@/shared/navigation/routes';

export function useNavigation() {
  const router = useRouter();

  return {
    auth: {
      login: () => router.push(routesPublic.login),
    },
    patients: {
      list: () => router.push(routesPrivate.patients.index),
      create: () => router.push(routesPrivate.patients.create),
      detail: (uuid: string) => router.push(routesPrivate.patients.detail(uuid)),
      edit: (uuid: string) => router.push(routesPrivate.patients.edit(uuid)),
    },
    back: () => router.back(),
  };
}
