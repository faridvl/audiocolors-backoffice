import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { routesPublic } from '@/shared/navigation/routes';

export interface AuthorizedPageProps {
  userName: string | null;
}

type SSRCallback = (
  context: GetServerSidePropsContext,
  token: string,
) => Promise<GetServerSidePropsResult<Record<string, unknown>>>;

/**
 * Guard de pagina privada. Solo comprueba que exista la cookie de sesion:
 * la validacion real de firma y expiracion la hace el API, y un 401 con
 * token presente cierra la sesion desde ApiServiceClient.
 */
export function authorizeServerSidePage(callback?: SSRCallback): GetServerSideProps {
  return async (context: GetServerSidePropsContext) => {
    const token = CookiesManager.getAccessToken(context);

    if (!token) {
      return {
        redirect: {
          destination: routesPublic.login,
          permanent: false,
        },
      };
    }

    const result = callback ? await callback(context, token) : { props: {} };
    const existingProps = 'props' in result ? result.props : {};

    return {
      ...result,
      props: {
        ...existingProps,
        userName: CookiesManager.getUserName(context) ?? null,
      },
    };
  };
}
