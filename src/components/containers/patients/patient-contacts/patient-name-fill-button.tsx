import React from 'react';
import { UserRound } from 'lucide-react';

interface PatientNameFillButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Ícono dentro del campo "Nombre" de un teléfono: lo llena con el nombre del
 * paciente, para cuando el número adicional es del propio paciente (trabajo,
 * segundo celular) y no de un familiar.
 */
export const PatientNameFillButton: React.FC<PatientNameFillButtonProps> = ({
  onClick,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title="Usar el nombre del paciente"
    aria-label="Usar el nombre del paciente"
    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 transition-colors hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-ink-400"
  >
    <UserRound className="h-4 w-4" aria-hidden />
  </button>
);

export function buildPatientFullName(firstName?: string, lastName?: string): string {
  return [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}
