import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { UserEditorContainer } from '@/components/containers/users-settings/user-editor-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function NewUserPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.USERS.FORM.NEW_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.USERS}>
        <UserEditorContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
