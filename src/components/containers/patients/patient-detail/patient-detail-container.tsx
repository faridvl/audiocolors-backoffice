import React from 'react';
import Link from 'next/link';
import {
  Pencil,
  Phone,
  Mail,
  IdCard,
  Cake,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { routesPrivate } from '@/shared/navigation/routes';
import { GENDER_LABELS, PatientGender } from '@/types/patients/patient';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { DocumentsContainer } from '@/components/containers/documents/documents-container';
import { calculateAge, formatDate, getFullName } from '@/shared/utils/formatters';

interface DataPointProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}

const DataPoint: React.FC<DataPointProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" aria-hidden />
    <div className="flex min-w-0 flex-col">
      <Typography variant={TypographyVariant.CAPTION}>{label}</Typography>
      <Typography variant={TypographyVariant.BODY_STRONG} className="break-words">
        {value || '—'}
      </Typography>
    </div>
  </div>
);

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
        <Typography variant={TypographyVariant.CARD_TITLE}>
          No se pudo cargar el paciente
        </Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const fullName = getFullName(patient.firstName, patient.lastName);
  const age = calculateAge(patient.birthDate);
  const genderLabel = patient.gender
    ? GENDER_LABELS[patient.gender as PatientGender] ?? patient.gender
    : null;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={routesPrivate.patients.index}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a pacientes
      </Link>

      <header className="rounded-card border border-navy-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant={TypographyVariant.PAGE_TITLE}>{fullName}</Typography>
              {!patient.isActive && (
                <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-500">
                  Inactivo
                </span>
              )}
            </div>

            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {[
                age !== null ? `${age} anios` : null,
                genderLabel,
              ]
                .filter(Boolean)
                .join(' · ') || 'Sin datos demograficos'}
            </Typography>
          </div>

          <Link
            href={routesPrivate.patients.edit(patient.uuid)}
            className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-navy-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <DataPoint icon={IdCard} label="Cedula" value={patient.documentId} />
          <DataPoint icon={Phone} label="Telefono" value={patient.phone} />
          <DataPoint icon={Mail} label="Correo" value={patient.email} />
          <DataPoint icon={Cake} label="Fecha de nacimiento" value={formatDate(patient.birthDate)} />
          <DataPoint icon={MapPin} label="Direccion" value={patient.address} />
        </div>
      </header>

      <DocumentsContainer patientUuid={patient.uuid} />
    </div>
  );
};
