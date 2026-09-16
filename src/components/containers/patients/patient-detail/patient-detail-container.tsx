import React, { useState } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Phone,
  Mail,
  IdCard,
  Cake,
  MapPin,
  Loader2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { routesPrivate } from '@/shared/navigation/routes';
import { GENDER_LABELS, Patient, PatientGender } from '@/types/patients/patient';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { DocumentsContainer } from '@/components/containers/documents/documents-container';
import { calculateAge, formatDate } from '@/shared/utils/formatters';
import { STATUS_STYLES, StatusTone } from '@/shared/design/tokens';
import { tailwind } from '@/utils/tailwind-utils';

/** Dato de contacto en una linea: icono + valor, sin etiqueta que gaste alto. */
const InlineDatum: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}> = ({ icon: Icon, label, value }) => {
  if (!value) return null;

  return (
    <span className="flex items-center gap-1.5 text-sm text-ink-600" title={label}>
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
      <span className="truncate">{value}</span>
    </span>
  );
};

/**
 * Cabecera del expediente.
 *
 * Todo cabe en un bloque: los documentos son lo que se consulta a diario, asi
 * que los datos del paciente no deben empujarlos fuera de pantalla. Lo
 * identificativo (nombre, cedula, telefono) va siempre visible en una linea;
 * el resto se despliega solo si se necesita.
 */
const PatientHeader: React.FC<{ patient: Patient }> = ({ patient }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const age = calculateAge(patient.birthDate);
  const genderLabel = patient.gender
    ? GENDER_LABELS[patient.gender as PatientGender] ?? patient.gender
    : null;

  const demographics = [age !== null ? `${age} años` : null, genderLabel]
    .filter(Boolean)
    .join(' · ');

  const hasExtraData = !!(patient.email || patient.address || patient.birthDate);

  return (
    <header className="rounded-card border border-ink-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
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
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  STATUS_STYLES[StatusTone.INACTIVE],
                )}
              >
                Inactivo
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasExtraData && (
            <button
              type="button"
              onClick={() => setIsExpanded((previous) => !previous)}
              aria-expanded={isExpanded}
              className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100"
            >
              {isExpanded ? 'Menos datos' : 'Más datos'}
              <ChevronDown
                className={tailwind('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                aria-hidden
              />
            </button>
          )}

          <Link
            href={routesPrivate.patients.edit(patient.uuid)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar
          </Link>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-ink-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <InlineDatum
            icon={Cake}
            label="Fecha de nacimiento"
            value={patient.birthDate ? formatDate(patient.birthDate) : null}
          />
          <InlineDatum icon={Mail} label="Correo" value={patient.email} />
          <InlineDatum icon={MapPin} label="Dirección" value={patient.address} />
        </div>
      )}
    </header>
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
      <PatientHeader patient={patient} />

      <DocumentsContainer patientUuid={patient.uuid} />
    </div>
  );
};
