import Head from 'next/head';
import { SplitScreenLayout } from '@/components/common/layout/split-screen-layout';
import { LoginContainer } from '@/components/containers/login/login-container';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Iniciar sesion · AudioColors Expedientes</title>
      </Head>

      <SplitScreenLayout
        imageSrc="/login-bg.jpeg"
        imageAlt="Laboratorio de audiologia de AudioColors"
      >
        <LoginContainer />
      </SplitScreenLayout>
    </>
  );
}
