import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { UsersSettingsContainer } from '@/components/containers/users-settings/users-settings-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function UsersSettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.USERS.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.USERS}>
        <UsersSettingsContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
