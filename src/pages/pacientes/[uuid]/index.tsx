import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientDetailContainer } from '@/components/containers/patients/patient-detail/patient-detail-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { routesPrivate } from '@/shared/navigation/routes';

export default function PatientDetailPage() {
  const router = useRouter();
  const uuid = typeof router.query.uuid === 'string' ? router.query.uuid : '';

  return (
    <>
      <Head>
        <title>AudioColors · Gestión Clínica</title>
      </Head>

      <AppLayout title="Gestión del paciente" backHref={routesPrivate.patients.index}>
        {uuid ? <PatientDetailContainer uuid={uuid} /> : null}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
