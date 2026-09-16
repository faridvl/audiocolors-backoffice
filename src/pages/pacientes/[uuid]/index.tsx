import Head from 'next/head';
import { useRouter } from 'next/router';
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

  // El titulo del header es el nombre del paciente: hace de rastro de
  // navegacion y evita repetirlo dentro del contenido.
  const patientName = patient
    ? getFullName(patient.firstName, patient.lastName)
    : 'Expediente';

  return (
    <>
      <Head>
        <title>{`${patientName} · AudioColors Expedientes`}</title>
      </Head>

      <AppLayout title={patientName} subtitle="Expediente" backHref={routesPrivate.patients.index}>
        {uuid ? <PatientDetailContainer uuid={uuid} /> : null}
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
