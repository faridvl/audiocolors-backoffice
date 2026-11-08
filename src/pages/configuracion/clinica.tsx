import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { ClinicSettingsContainer } from '@/components/containers/clinic-settings/clinic-settings-container';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function ClinicSettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.CLINIC.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.CLINIC}>
        <ClinicSettingsContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
