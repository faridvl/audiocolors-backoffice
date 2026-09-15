import React from 'react';
import Link from 'next/link';
import {
  Pencil,
  Phone,
  Mail,
  IdCard,
  Cake,
  MapPin,
  User,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { routesPrivate } from '@/shared/navigation/routes';
import { GENDER_LABELS, PatientGender } from '@/types/patients/patient';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormViewSection, FormViewLabel } from '@/components/common/form/form-view-section';
import { DocumentsContainer } from '@/components/containers/documents/documents-container';
import { calculateAge, formatDate, getFullName } from '@/shared/utils/formatters';
import { STATUS_STYLES, StatusTone } from '@/shared/design/tokens';
import { tailwind } from '@/utils/tailwind-utils';

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

  const fullName = getFullName(patient.firstName, patient.lastName);
  const age = calculateAge(patient.birthDate);
  const genderLabel = patient.gender
    ? GENDER_LABELS[patient.gender as PatientGender] ?? patient.gender
    : null;

  const demographics =
    [age !== null ? `${age} anios` : null, genderLabel].filter(Boolean).join(' · ') || null;

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={routesPrivate.patients.index}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a pacientes
      </Link>

      <header className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50">
            <User className="h-5 w-5 text-brand-600" aria-hidden />
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant={TypographyVariant.HEADER}>{fullName}</Typography>
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

            <Typography variant={TypographyVariant.HELPER} className="mt-1">
              {demographics ?? 'Sin datos demograficos'}
            </Typography>
          </div>
        </div>

        <Link
          href={routesPrivate.patients.edit(patient.uuid)}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 sm:w-auto"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Editar
        </Link>
      </header>

      <FormViewSection title="Datos del paciente">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FormViewLabel icon={IdCard} label="Cedula" value={patient.documentId} />
          <FormViewLabel
            icon={Cake}
            label="Fecha de nacimiento"
            value={patient.birthDate ? formatDate(patient.birthDate) : null}
          />
          <FormViewLabel icon={Phone} label="Telefono" value={patient.phone} />
          <FormViewLabel icon={Mail} label="Correo" value={patient.email} />
          <FormViewLabel
            icon={MapPin}
            label="Direccion"
            value={patient.address}
            className="sm:col-span-2"
          />
        </div>
      </FormViewSection>

      <DocumentsContainer patientUuid={patient.uuid} />
    </div>
  );
};
