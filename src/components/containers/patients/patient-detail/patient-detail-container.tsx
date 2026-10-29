import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { PatientStatus } from '@/types/patients/patient';
import { TEXT } from '@/static/texts/i18n';
import { PatientFlagsModal } from '@/components/containers/patients/patient-flags/patient-flags-modal';
import { ChangePatientStatusModal } from '@/components/containers/patients/patient-status/change-patient-status-modal';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { DocumentsContainer } from '@/components/containers/documents/documents-container';
import { PatientPhysicalExamContainer } from '@/components/containers/patients/patient-physical-exam/patient-physical-exam-container';
import { PatientQuestionsContainer } from '@/components/containers/patients/patient-questions/patient-questions-container';
import { PatientNotesContainer } from '@/components/containers/patients/patient-notes/patient-notes-container';
import { ScheduleAppointmentModal } from '@/components/containers/patients/schedule-appointment/schedule-appointment-modal';
import { useNavigation } from '@/hooks/use-navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/shared/auth/permissions';
import { EditContactsModal } from '@/components/containers/patients/patient-contacts/edit-contacts-modal';
import { PatientSummary } from './patient-summary';

interface PatientDetailContainerProps {
  uuid: string;
}

export const PatientDetailContainer: React.FC<PatientDetailContainerProps> = ({ uuid }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { can } = usePermissions();
  const { data: patient, isLoading, isError, refetch } = usePatientQuery(uuid);
  const [isSchedulingAppointment, setIsSchedulingAppointment] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEditingFlags, setIsEditingFlags] = useState(false);
  const [isEditingContacts, setIsEditingContacts] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>{t(TEXT.PATIENTS.DETAIL.LOADING)}</Typography>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.ACCENT}>
          {t(TEXT.PATIENTS.DETAIL.LOAD_ERROR)}
        </Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()}>
          {t(TEXT.GENERAL.BUTTONS.RETRY)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PatientSummary
        patient={patient}
        onScheduleAppointment={() => setIsSchedulingAppointment(true)}
        onChangeStatus={() => setIsChangingStatus(true)}
        onEditFlags={() => setIsEditingFlags(true)}
        onEditContacts={() => setIsEditingContacts(true)}
        onEdit={() => navigation.patients.edit(patient.uuid)}
      />

      {/* El empleado ve los datos generales y los archivos, nada clínico. */}
      {can(Permission.VIEW_CLINICAL_RECORD) && (
        <>
          <PatientPhysicalExamContainer patientUuid={patient.uuid} />
          <PatientQuestionsContainer patientUuid={patient.uuid} />
          <PatientNotesContainer patientUuid={patient.uuid} />
        </>
      )}

      <DocumentsContainer patientUuid={patient.uuid} />

      {isChangingStatus && (
        <ChangePatientStatusModal
          patientUuid={patient.uuid}
          currentStatus={patient.status ?? PatientStatus.ACTIVE}
          currentReason={patient.statusReason}
          currentDate={patient.statusDate}
          onClose={() => setIsChangingStatus(false)}
        />
      )}

      {isEditingContacts && (
        <EditContactsModal patient={patient} onClose={() => setIsEditingContacts(false)} />
      )}

      {isEditingFlags && (
        <PatientFlagsModal patient={patient} onClose={() => setIsEditingFlags(false)} />
      )}

      {isSchedulingAppointment && (
        <ScheduleAppointmentModal
          patientUuid={patient.uuid}
          tentativeMonth={patient.tentativeAppointmentMonth}
          tentativeTypeUuid={patient.tentativeAppointmentTypeUuid}
          branchUuid={patient.branchUuid}
          nextAppointmentAt={patient.nextAppointmentAt}
          nextAppointmentTypeName={patient.nextAppointmentType}
          onClose={() => setIsSchedulingAppointment(false)}
        />
      )}
    </div>
  );
};
