import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { RequirePermission } from '@/components/common/permission/require-permission';
import { PatientActivityContainer } from '@/components/containers/patient-activity/patient-activity-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { Permission } from '@/shared/auth/permissions';
import { TEXT } from '@/static/texts/i18n';

export default function ActivityPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.ACTIVITY.PAGE_TITLE)}</title>
      </Head>

      <AppLayout title={t(TEXT.ACTIVITY.TITLE)}>
        <RequirePermission permission={Permission.VIEW_ACTIVITY}>
          <PatientActivityContainer />
        </RequirePermission>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
