import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { SplitScreenLayout } from '@/components/common/layout/split-screen-layout';
import { LoginContainer } from '@/components/containers/login/login-container';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Iniciar sesión · AudioColors Expedientes</title>
      </Head>

      <SplitScreenLayout>
        <LoginContainer />
      </SplitScreenLayout>
    </>
  );
}

/**
 * Sin data que buscar, pero forzar SSR: como pagina estatica (SSG), Vercel la
 * cachea en el Edge y sirve el mismo HTML para cualquier host — _document.tsx
 * detecta dev vs prod por el header `host`, y sin SSR ese chequeo solo corre
 * una vez en build time (queda "congelado" con un solo resultado).
 */
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
