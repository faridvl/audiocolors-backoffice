import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/common/layout/app-layout';
import { RequirePermission } from '@/components/common/permission/require-permission';
import { PatientEditContainer } from '@/components/containers/patients/patient-edit/patient-edit-container';
import { authorizeServerSidePage } from '@/hocs/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/shared/auth/permissions';
import { routesPrivate } from '@/shared/navigation/routes';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { getFullName } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';

export default function EditPatientPage() {
  const router = useRouter();
  const uuid = typeof router.query.uuid === 'string' ? router.query.uuid : '';
  const { t } = useTranslation();
  const { can } = usePermissions();
  const detailHref = uuid ? routesPrivate.patients.detail(uuid) : routesPrivate.patients.index;
  // Sin permiso la pantalla no pide los datos del paciente.
  const { data: patient } = usePatientQuery(uuid, can(Permission.EDIT_PATIENT));

  const patientName = patient ? getFullName(patient.firstName, patient.lastName) : undefined;

  return (
    <>
      <Head>
        <title>AudioColors · Gestión Clínica</title>
      </Head>

      <AppLayout
        title="Modificar paciente"
        subtitle={patientName}
        backHref={detailHref}
      >
        <RequirePermission
          permission={Permission.EDIT_PATIENT}
          message={t(TEXT.PATIENTS.DETAIL.EDIT_FORBIDDEN)}
          backHref={detailHref}
          backLabel={t(TEXT.PATIENTS.DETAIL.EDIT_FORBIDDEN_BACK)}
        >
          {uuid ? <PatientEditContainer uuid={uuid} /> : null}
        </RequirePermission>
      </AppLayout>
    </>
  );
}

export const getServerSideProps = authorizeServerSidePage();
