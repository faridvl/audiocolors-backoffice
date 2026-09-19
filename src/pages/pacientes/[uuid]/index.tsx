import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Pencil } from 'lucide-react';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientDetailContainer } from '@/components/containers/patients/patient-detail/patient-detail-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { routesPrivate } from '@/shared/navigation/routes';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { getFullName } from '@/shared/utils/formatters';

export default function PatientDetailPage() {
  const router = useRouter();
  const uuid = typeof router.query.uuid === 'string' ? router.query.uuid : '';
  const { data: patient } = usePatientQuery(uuid);

  const patientName = patient ? getFullName(patient.firstName, patient.lastName) : undefined;

  const editAction = uuid ? (
    <Link
      href={routesPrivate.patients.edit(uuid)}
      aria-label="Editar paciente"
      title="Editar paciente"
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 md:px-3.5"
    >
      <Pencil className="h-4 w-4" aria-hidden />
      <span className="hidden md:inline">Editar</span>
    </Link>
  ) : null;

  return (
    <>
      <Head>
        <title>AudioColors · Gestión Clínica</title>
      </Head>

      <AppLayout
        title="Gestión del paciente"
        subtitle={patientName}
        backHref={routesPrivate.patients.index}
        action={editAction}
      >
        {uuid ? <PatientDetailContainer uuid={uuid} /> : null}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
