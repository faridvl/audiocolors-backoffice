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
