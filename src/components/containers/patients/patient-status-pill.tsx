import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';
import { PATIENT_STATUS_LABELS, PatientStatus } from '@/types/patients/patient';

const STATUS_TONES: Record<PatientStatus, string> = {
  [PatientStatus.ACTIVE]: 'bg-success/10 text-success',
  [PatientStatus.INACTIVE]: 'bg-warning/15 text-ink-700',
  [PatientStatus.DECEASED]: 'bg-ink-200 text-ink-700',
};

interface PatientStatusPillProps {
  status?: PatientStatus;
  /** Mostrar también "Activo". Por defecto solo se marca lo que no es activo. */
  showActive?: boolean;
  className?: string;
}

/**
 * Etiqueta del estado del paciente. En listados solo se marcan inactivos y
 * fallecidos: el activo es lo normal y una etiqueta en cada fila sería ruido.
 */
export const PatientStatusPill: React.FC<PatientStatusPillProps> = ({
  status = PatientStatus.ACTIVE,
  showActive = false,
  className,
}) => {
  if (status === PatientStatus.ACTIVE && !showActive) return null;

  return (
    <span
      className={tailwind(
        'inline-block w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_TONES[status],
        className,
      )}
    >
      {PATIENT_STATUS_LABELS[status]}
    </span>
  );
};
