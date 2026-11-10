import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { QuestionsSettingsContainer } from '@/components/containers/questions/questions-settings-container';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function QuestionsSettingsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.QUESTIONS.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.QUESTIONS}>
        <QuestionsSettingsContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
