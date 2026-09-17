import React, { useState } from 'react';
import { Phone, Mail, IdCard, Cake, MapPin, Building2, Loader2, AlertTriangle } from 'lucide-react';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { GENDER_LABELS, Patient, PatientGender } from '@/types/patients/patient';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { DocumentsContainer } from '@/components/containers/documents/documents-container';
import { PatientContactsContainer } from '@/components/containers/patients/patient-contacts/patient-contacts-container';
import { PatientNotesContainer } from '@/components/containers/patients/patient-notes/patient-notes-container';
import { calculateAge, formatDate } from '@/shared/utils/formatters';
import { STATUS_STYLES, StatusTone } from '@/shared/design/tokens';
import { tailwind } from '@/utils/tailwind-utils';

/** Dato en una linea: icono + valor. La etiqueta va en el title, no ocupa alto. */
const InlineDatum: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}> = ({ icon: Icon, label, value }) => {
  if (!value) return null;

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink-600" title={label}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
      <span className="truncate">{value}</span>
    </span>
  );
};

/**
 * Barra de datos del expediente.
 *
 * Los documentos son lo que se consulta a diario, asi que los datos del
 * paciente se resumen en una franja: nunca deben empujar los archivos fuera
 * de pantalla. El nombre y la accion de editar viven en el header de la
 * pagina, no aqui.
 */
const PatientSummary: React.FC<{ patient: Patient }> = ({ patient }) => {
  const [showAllData, setShowAllData] = useState(false);
  const { data: branches } = useBranchesQuery();

  const age = calculateAge(patient.birthDate);
  const genderLabel = patient.gender
    ? GENDER_LABELS[patient.gender as PatientGender] ?? patient.gender
    : null;

  const demographics = [age !== null ? `${age} años` : null, genderLabel]
    .filter(Boolean)
    .join(' · ');

  const branchName = patient.branchUuid
    ? branches?.find((branch) => branch.uuid === patient.branchUuid)?.name ?? null
    : null;

  const hasExtraData = !!(patient.email || patient.address || patient.birthDate || branchName);

  return (
    <section className="rounded-card border border-ink-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-y-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
        <InlineDatum icon={IdCard} label="Cédula" value={patient.documentId} />
        <InlineDatum icon={Phone} label="Teléfono" value={patient.phone} />

        {demographics && (
          <Typography variant={TypographyVariant.HELPER} inline>
            {demographics}
          </Typography>
        )}

        {!patient.isActive && (
          <span
            className={tailwind(
              'w-fit rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_STYLES[StatusTone.INACTIVE],
            )}
          >
            Inactivo
          </span>
        )}
      </div>

      {showAllData && (
        <div className="mt-3 flex flex-col gap-y-2 border-t border-ink-100 pt-3 sm:flex-row sm:flex-wrap sm:gap-x-5">
          <InlineDatum
            icon={Cake}
            label="Fecha de nacimiento"
            value={patient.birthDate ? formatDate(patient.birthDate) : null}
          />
          <InlineDatum icon={Mail} label="Correo" value={patient.email} />
          <InlineDatum icon={MapPin} label="Dirección" value={patient.address} />
          <InlineDatum icon={Building2} label="Sede" value={branchName} />
        </div>
      )}

      {hasExtraData && (
        <button
          type="button"
          onClick={() => setShowAllData((previous) => !previous)}
          aria-expanded={showAllData}
          className="mt-2 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800 hover:underline"
        >
          {showAllData ? 'Ocultar datos' : 'Ver todos los datos'}
        </button>
      )}
    </section>
  );
};

interface PatientDetailContainerProps {
  uuid: string;
}

export const PatientDetailContainer: React.FC<PatientDetailContainerProps> = ({ uuid }) => {
  const { data: patient, isLoading, isError, refetch } = usePatientQuery(uuid);

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
      <PatientSummary patient={patient} />

      <PatientContactsContainer patientUuid={patient.uuid} />

      <PatientNotesContainer patientUuid={patient.uuid} />

      <DocumentsContainer patientUuid={patient.uuid} />
    </div>
  );
};
