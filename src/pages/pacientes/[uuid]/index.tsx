import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientDetailContainer } from '@/components/containers/patients/patient-detail/patient-detail-container';
import { authorizeServerSidePage } from '@/hocs/auth';

export default function PatientDetailPage() {
  const router = useRouter();
  const uuid = typeof router.query.uuid === 'string' ? router.query.uuid : '';

  return (
    <>
      <Head>
        <title>Expediente del paciente</title>
      </Head>

      <AppLayout title="Expediente">
        {uuid ? <PatientDetailContainer uuid={uuid} /> : null}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
