import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientActivityContainer } from '@/components/containers/patient-activity/patient-activity-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { TEXT } from '@/static/texts/i18n';

export default function ActivityPage() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t(TEXT.ACTIVITY.PAGE_TITLE)}</title>
      </Head>

      <AppLayout title={t(TEXT.ACTIVITY.TITLE)}>
        <PatientActivityContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
