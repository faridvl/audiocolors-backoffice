import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout } from '@/components/common/layout/app-layout';
import { RequirePermission } from '@/components/common/permission/require-permission';
import { PatientEditContainer } from '@/components/containers/patients/patient-edit/patient-edit-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { Permission } from '@/shared/auth/permissions';
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
        title="Modificar paciente"
        subtitle={patientName}
        backHref={uuid ? routesPrivate.patients.detail(uuid) : routesPrivate.patients.index}
      >
        <RequirePermission permission={Permission.EDIT_PATIENT}>
          {uuid ? <PatientEditContainer uuid={uuid} /> : null}
        </RequirePermission>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
