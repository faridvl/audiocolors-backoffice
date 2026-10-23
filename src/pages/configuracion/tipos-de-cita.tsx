import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppointmentTypesSettingsContainer } from '@/components/containers/appointment-types-settings/appointment-types-settings-container';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function AppointmentTypesSettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.APPOINTMENT_TYPES.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.APPOINTMENT_TYPES}>
        <AppointmentTypesSettingsContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
