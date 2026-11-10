import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { BranchesSettingsContainer } from '@/components/containers/branches-settings/branches-settings-container';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function BranchesSettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.SETTINGS.BRANCHES.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.BRANCHES}>
        <BranchesSettingsContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
