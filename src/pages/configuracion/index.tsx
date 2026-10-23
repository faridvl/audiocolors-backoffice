import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { SettingsHomeContainer } from '@/components/containers/settings/settings-home-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.PAGE_TITLE)}</title>
      </Head>

      <AppLayout title={t(TEXT.SETTINGS.TITLE)}>
        <SettingsHomeContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
