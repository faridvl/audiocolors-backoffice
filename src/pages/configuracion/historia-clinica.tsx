import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { ClinicalHistoryTemplateContainer } from '@/components/containers/clinical-history-template/clinical-history-template-container';
import { SettingsLayout } from '@/components/containers/settings/settings-layout';
import { SettingsSection } from '@/components/containers/settings/settings-sections';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function ClinicalHistoryTemplatePage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.CLINICAL_TEMPLATE.PAGE_TITLE)}</title>
      </Head>

      <SettingsLayout section={SettingsSection.CLINICAL_HISTORY}>
        <ClinicalHistoryTemplateContainer />
      </SettingsLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
