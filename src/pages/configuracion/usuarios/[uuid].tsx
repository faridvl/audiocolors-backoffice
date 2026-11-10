import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { UserEditorContainer } from '@/components/containers/users-settings/user-editor-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function EditUserPage() {
  const { t } = useTranslation();
  const { query } = useRouter();
  const userUuid = typeof query.uuid === 'string' ? query.uuid : undefined;

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.USERS.FORM.EDIT_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.USERS}>
        <UserEditorContainer userUuid={userUuid} />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
