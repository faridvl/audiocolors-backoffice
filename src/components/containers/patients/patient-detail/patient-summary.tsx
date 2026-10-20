import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { PatientStatusPill } from '@/components/containers/patients/patient-status-pill';
import { PatientFlagPills } from '@/components/containers/patients/patient-flags/patient-flag-pills';
import { VideoCandidateCheck } from '@/components/containers/patients/patient-flags/video-candidate-check';
import { PatientContactsContainer } from '@/components/containers/patients/patient-contacts/patient-contacts-container';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { calculateAge, formatDate, getFullName } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import {
  GENDER_LABELS,
  Patient,
  PatientFlag,
  PatientGender,
  PatientStatus,
} from '@/types/patients/patient';
import { NextAppointmentBlock } from './next-appointment-block';
import { PatientActions } from './patient-actions';
import { PatientDatum } from './patient-datum';

/** Los que se cambian desde el modal; candidato a video tiene su casilla. */
const MODAL_FLAGS = [
  PatientFlag.HEARING_AIDS_IN_LAB,
  PatientFlag.ACTIVE_WARRANTY,
  PatientFlag.WARRANTY_EXPIRED,
  PatientFlag.RENEW_PRESCRIPTION,
];

interface PatientSummaryProps {
  patient: Patient;
  onScheduleAppointment: () => void;
  onChangeStatus: () => void;
  onEditFlags: () => void;
  onEditContacts: () => void;
  onEdit: () => void;
}

/**
 * Tarjeta de datos del expediente: quién es arriba, lo que se usa a diario
 * (cita y teléfonos) en el medio y el resto de los datos al pie. El azul queda
 * solo para las acciones.
 */
export const PatientSummary: React.FC<PatientSummaryProps> = ({
  patient,
  onScheduleAppointment,
  onChangeStatus,
  onEditFlags,
  onEditContacts,
  onEdit,
}) => {
  const { t } = useTranslation();
  const { data: branches } = useBranchesQuery();

  const age = calculateAge(patient.birthDate);
  const genderLabel = patient.gender
    ? (GENDER_LABELS[patient.gender as PatientGender] ?? patient.gender)
    : null;
  const identity = [
    patient.documentId,
    age !== null ? t(TEXT.PATIENTS.DETAIL.AGE, { count: age }) : null,
    genderLabel,
  ]
    .filter(Boolean)
    .join(' · ');

  const branchName = patient.branchUuid
    ? (branches?.find((branch) => branch.uuid === patient.branchUuid)?.name ?? null)
    : null;

  // A un paciente fallecido no se le agendan citas (el API lo rechaza).
  const isDeceased = patient.status === PatientStatus.DECEASED;
  const statusDetail = [
    patient.statusDate ? formatDate(patient.statusDate) : null,
    patient.statusReason,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="flex gap-4 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Typography variant={TypographyVariant.SUBTITLE} as="p" className="break-words">
              {getFullName(patient.firstName, patient.lastName)}
            </Typography>
            <PatientStatusPill status={patient.status} />
          </div>
          {identity && (
            <Typography variant={TypographyVariant.HELPER} className="mt-0.5">
              {identity}
            </Typography>
          )}
          {statusDetail && (
            <Typography variant={TypographyVariant.HELPER}>{statusDetail}</Typography>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <PatientFlagPills patient={patient} flags={MODAL_FLAGS} onClick={onEditFlags} />
          <VideoCandidateCheck patient={patient} />
        </div>

        <div className="mt-4 grid gap-4 border-t border-ink-100 pt-4 sm:grid-cols-2">
          <NextAppointmentBlock
            patient={patient}
            onSchedule={isDeceased ? undefined : onScheduleAppointment}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.PATIENTS.DETAIL.CONTACTS)}
            </Typography>
            <PatientContactsContainer
              patientUuid={patient.uuid}
              patientPhone={patient.phone}
              onEdit={onEditContacts}
            />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ink-100 pt-4 sm:grid-cols-4">
          <PatientDatum
            label={t(TEXT.PATIENTS.DETAIL.FIELDS.BIRTH_DATE)}
            value={patient.birthDate ? formatDate(patient.birthDate) : null}
          />
          <PatientDatum label={t(TEXT.PATIENTS.DETAIL.FIELDS.BRANCH)} value={branchName} />
        </dl>
      </div>

      <PatientActions onEdit={onEdit} onChangeStatus={onChangeStatus} onEditFlags={onEditFlags} />
    </section>
  );
};
