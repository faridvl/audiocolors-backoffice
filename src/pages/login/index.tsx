import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { SplitScreenLayout } from '@/components/common/layout/split-screen-layout';
import { LoginContainer } from '@/components/containers/login/login-container';
import { TEXT } from '@/static/texts/i18n';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.AUTH.LOGIN.PAGE_TITLE)}</title>
      </Head>

      <SplitScreenLayout>
        <LoginContainer />
      </SplitScreenLayout>
    </>
  );
}

// Sin data que buscar, pero forzar SSR: como página estática, Vercel la
// cachea en el Edge y _document.tsx dejaría de distinguir dev vs prod por host.
export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
