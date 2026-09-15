import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientEditContainer } from '@/components/containers/patients/patient-edit/patient-edit-container';
import { authorizeServerSidePage } from '@/hocs/auth';

export default function EditPatientPage() {
  const router = useRouter();
  const uuid = typeof router.query.uuid === 'string' ? router.query.uuid : '';

  return (
    <>
      <Head>
        <title>Editar paciente · AudioColors Expedientes</title>
      </Head>

      <AppLayout title="Editar paciente">
        {uuid ? <PatientEditContainer uuid={uuid} /> : null}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
