import { GetServerSideProps } from 'next';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { routesPrivate, routesPublic } from '@/shared/navigation/routes';

/** Raiz: nunca se renderiza, solo enruta segun haya sesión o no. */
export default function RootPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = CookiesManager.getAccessToken(context);

  return {
    redirect: {
      destination: token ? routesPrivate.patients.index : routesPublic.login,
      permanent: false,
    },
  };
};
