import Head from 'next/head';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientListContainer } from '@/components/containers/patients/patients-list/patient-list-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { routesPrivate } from '@/shared/navigation/routes';

export default function PatientsPage() {
  return (
    <>
      <Head>
        <title>Pacientes · AudioColors Expedientes</title>
      </Head>

      <AppLayout
        title="Pacientes"
        action={
          <Link
            href={routesPrivate.patients.create}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Nuevo paciente</span>
          </Link>
        }
      >
        <PatientListContainer />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
