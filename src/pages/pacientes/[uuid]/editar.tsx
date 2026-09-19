import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout } from '@/components/common/layout/app-layout';
import { PatientEditContainer } from '@/components/containers/patients/patient-edit/patient-edit-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { routesPrivate } from '@/shared/navigation/routes';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { getFullName } from '@/shared/utils/formatters';

export default function EditPatientPage() {
  const router = useRouter();
  const uuid = typeof router.query.uuid === 'string' ? router.query.uuid : '';
  const { data: patient } = usePatientQuery(uuid);

  const patientName = patient ? getFullName(patient.firstName, patient.lastName) : undefined;

  return (
    <>
      <Head>
        <title>AudioColors · Gestión Clínica</title>
      </Head>

      <AppLayout
        title="Editar paciente"
        subtitle={patientName}
        backHref={uuid ? routesPrivate.patients.detail(uuid) : routesPrivate.patients.index}
      >
        {uuid ? <PatientEditContainer uuid={uuid} /> : null}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
