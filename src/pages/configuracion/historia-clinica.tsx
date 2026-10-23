import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { ClinicalHistoryTemplateContainer } from '@/components/containers/clinical-history-template/clinical-history-template-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function ClinicalHistoryTemplatePage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.CLINICAL_TEMPLATE.PAGE_TITLE)}</title>
      </Head>

      <AppLayout title={t(TEXT.CLINICAL_TEMPLATE.TITLE)}>
        <ClinicalHistoryTemplateContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
