import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { RequirePermission } from '@/components/common/permission/require-permission';
import { ClinicalHistoryTemplateContainer } from '@/components/containers/clinical-history-template/clinical-history-template-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { Permission } from '@/shared/auth/permissions';
import { TEXT } from '@/static/texts/i18n';

export default function ClinicalHistoryTemplatePage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.CLINICAL_TEMPLATE.PAGE_TITLE)}</title>
      </Head>

      <AppLayout title={t(TEXT.CLINICAL_TEMPLATE.TITLE)}>
        <RequirePermission permission={Permission.EDIT_CLINICAL_TEMPLATE}>
          <ClinicalHistoryTemplateContainer />
        </RequirePermission>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
