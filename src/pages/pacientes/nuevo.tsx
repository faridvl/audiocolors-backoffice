import Head from 'next/head';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientCreateContainer } from '@/components/containers/patients/patient-create/patient-create-container';
import { authorizeServerSidePage } from '@/hocs/auth';

export default function NewPatientPage() {
  return (
    <>
      <Head>
        <title>Nuevo paciente · AudioColors Gestión Clínica</title>
      </Head>

      <AppLayout title="Nuevo paciente">
        <PatientCreateContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
