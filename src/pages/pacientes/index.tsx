import Head from 'next/head';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientListContainer } from '@/components/containers/patients/patients-list/patient-list-container';
import { authorizeServerSidePage } from '@/hocs/auth';

export default function PatientsPage() {
  return (
    <>
      <Head>
        <title>Pacientes · AudioColors Gestión Clínica</title>
      </Head>

      <AppLayout title="Pacientes">
        <PatientListContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
