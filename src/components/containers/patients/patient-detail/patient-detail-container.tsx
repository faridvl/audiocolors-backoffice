import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  User,
  Mail,
  IdCard,
  Cake,
  MapPin,
  Building2,
  CalendarPlus,
  CalendarClock,
  Pencil,
  UserCog,
  MoreHorizontal,
  Ear,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { GENDER_LABELS, Patient, PatientGender, PatientStatus } from '@/types/patients/patient';
import { PatientStatusPill } from '@/components/containers/patients/patient-status-pill';
import { PatientFlagPills } from '@/components/containers/patients/patient-flags/patient-flag-pills';
import { PatientFlagsModal } from '@/components/containers/patients/patient-flags/patient-flags-modal';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { ChangePatientStatusModal } from '@/components/containers/patients/patient-status/change-patient-status-modal';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { DocumentsContainer } from '@/components/containers/documents/documents-container';
import { PatientContactsContainer } from '@/components/containers/patients/patient-contacts/patient-contacts-container';
import { PatientNotesContainer } from '@/components/containers/patients/patient-notes/patient-notes-container';
import { ScheduleAppointmentModal } from '@/components/containers/patients/schedule-appointment/schedule-appointment-modal';
import { calculateAge, formatDate, formatMonthLabel, getFullName } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { useNavigation } from '@/hooks/use-navigation';

/** Dato en una linea: icono + valor. La etiqueta va en el title, no ocupa alto. */
const InlineDatum: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  className?: string;
}> = ({ icon: Icon, label, value, className }) => {
  if (!value) return null;

  return (
    <span
      className={tailwind('flex min-w-0 items-center gap-1.5 text-sm text-ink-600', className)}
      title={label}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
      <span className="truncate">{value}</span>
    </span>
  );
};

/** Acciones poco frecuentes del paciente: en un menú para no competir con los datos. */
const PatientActionsMenu: React.FC<{
  onEdit: () => void;
  onChangeStatus: () => void;
  onEditFlags: () => void;
}> = ({ onEdit, onChangeStatus, onEditFlags }) => {
  const { t } = useTranslation();
  const items = [
    { label: 'Modificar paciente', icon: Pencil, onClick: onEdit },
    { label: 'Cambiar estado', icon: UserCog, onClick: onChangeStatus },
    { label: t(TEXT.PATIENTS.FLAGS.MENU), icon: Ear, onClick: onEditFlags },
  ];

  return (
    <Menu as="div" className="relative shrink-0">
      <Menu.Button
        aria-label="Más acciones"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </Menu.Button>
      <Menu.Items className="absolute right-0 z-20 mt-1 w-52 origin-top-right rounded-lg border border-ink-200 bg-white py-1 shadow-lg focus:outline-none">
        {items.map((item) => (
          <Menu.Item key={item.label}>
            {({ active }) => (
              <button
                type="button"
                onClick={item.onClick}
                className={tailwind(
                  'flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700',
                  active && 'bg-ink-50',
                )}
              >
                <item.icon className="h-4 w-4 text-ink-500" aria-hidden />
                {item.label}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};

/**
 * Barra de datos del expediente.
 *
 * Los documentos son lo que se consulta a diario, asi que los datos del
 * paciente se resumen en una franja: nunca deben empujar los archivos fuera
 * de pantalla.
 */
const PatientSummary: React.FC<{
  patient: Patient;
  onScheduleAppointment: () => void;
  onChangeStatus: () => void;
  onEditFlags: () => void;
  onEdit: () => void;
}> = ({ patient, onScheduleAppointment, onChangeStatus, onEditFlags, onEdit }) => {
  const [showAllData, setShowAllData] = useState(false);
  const { data: branches } = useBranchesQuery();

  const age = calculateAge(patient.birthDate);
  const genderLabel = patient.gender
    ? (GENDER_LABELS[patient.gender as PatientGender] ?? patient.gender)
    : null;

  const demographics = [age !== null ? `${age} años` : null, genderLabel]
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

  // El mes tentativo se muestra distinto de la fecha confirmada: "(por
  // confirmar)" avisa que ese paciente todavia hay que llamarlo.
  let scheduleTitle = 'Agendar próxima cita';
  if (patient.nextAppointmentAt) {
    scheduleTitle = `Próxima cita: ${formatDate(patient.nextAppointmentAt)} · Reagendar`;
  } else if (patient.tentativeAppointmentMonth) {
    const tentativeType = patient.tentativeAppointmentTypeName
      ? ` · ${patient.tentativeAppointmentTypeName}`
      : '';
    scheduleTitle = `Próxima cita: ${formatMonthLabel(patient.tentativeAppointmentMonth)}${tentativeType} (por confirmar)`;
  }

  return (
    <section className="rounded-card border border-ink-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-1.5">
          <Typography
            variant={TypographyVariant.ACCENT}
            className="flex min-w-0 items-center gap-1.5 break-words text-brand-700"
          >
            <User className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
            {getFullName(patient.firstName, patient.lastName)}
          </Typography>
          <PatientStatusPill status={patient.status} />
          <PatientFlagPills patient={patient} onClick={onEditFlags} />
          {statusDetail && (
            <Typography variant={TypographyVariant.HELPER} inline className="truncate">
              {statusDetail}
            </Typography>
          )}
        </div>

        <PatientActionsMenu
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onEditFlags={onEditFlags}
        />
      </div>

      {!isDeceased && (
        <button
          type="button"
          onClick={onScheduleAppointment}
          className="mb-3 mt-1 flex items-start gap-1.5 text-left text-sm font-medium text-brand-700 hover:underline"
        >
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {scheduleTitle}
        </button>
      )}
      {isDeceased && <div className="mb-3" />}

      <div className="flex flex-col gap-y-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
        <InlineDatum icon={IdCard} label="Cédula" value={patient.documentId} />

        {demographics && (
          <Typography variant={TypographyVariant.HELPER} inline>
            {demographics}
          </Typography>
        )}
      </div>

      <div className="mt-2">
        <PatientContactsContainer
          patientUuid={patient.uuid}
          patientPhone={patient.phone}
          onEdit={onEdit}
        />
      </div>

      {showAllData && (
        <div className="mt-3 flex flex-col gap-y-2 border-t border-ink-100 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          <InlineDatum
            icon={Cake}
            label="Fecha de nacimiento"
            value={patient.birthDate ? formatDate(patient.birthDate) : null}
          />
          <InlineDatum icon={Mail} label="Correo" value={patient.email} />
          <InlineDatum icon={MapPin} label="Dirección" value={patient.address} />
          <InlineDatum icon={Building2} label="Sede" value={branchName} />
          <InlineDatum
            icon={CalendarPlus}
            label="Registro"
            value={patient.createdAt ? formatDate(patient.createdAt) : null}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAllData((previous) => !previous)}
        aria-expanded={showAllData}
        className="mt-3 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800 hover:underline"
      >
        {showAllData ? 'Ocultar datos' : 'Ver todos los datos'}
      </button>
    </section>
  );
};

interface PatientDetailContainerProps {
  uuid: string;
}

export const PatientDetailContainer: React.FC<PatientDetailContainerProps> = ({ uuid }) => {
  const navigation = useNavigation();
  const { data: patient, isLoading, isError, refetch } = usePatientQuery(uuid);
  const [isSchedulingAppointment, setIsSchedulingAppointment] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEditingFlags, setIsEditingFlags] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>Cargando expediente...</Typography>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.ACCENT}>No se pudo cargar el paciente</Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()}>
          Reintentar
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
        onEdit={() => navigation.patients.edit(patient.uuid)}
      />

      <PatientNotesContainer patientUuid={patient.uuid} />

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
