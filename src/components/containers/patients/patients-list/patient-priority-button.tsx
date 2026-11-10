import React from 'react';
import { Flag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { PriorityReasonModal } from '@/components/containers/patients/patient-flags/priority-reason-modal';
import { usePatientPriority } from '@/components/containers/patients/patient-flags/use-patient-priority';
import { getPriorityReasonText } from '@/components/containers/patients/patient-flags/priority-reason';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/shared/auth/permissions';
import { getFullName } from '@/shared/utils/formatters';
import { Patient } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';

/**
 * Marca o quita la prioridad desde la lista o el expediente; no cambia el orden. Sin permiso
 * de cambiarla se ve el estado: en el expediente con su etiqueta, en la lista solo el ícono.
 */
export const PatientPriorityButton: React.FC<{
  patient: Patient;
  className?: string;
  /** Etiqueta de texto visible junto a la bandera cuando es de solo lectura. */
  showLabel?: boolean;
}> = ({ patient, className, showLabel = false }) => {
  const { t } = useTranslation();
  const {
    isOn,
    isUpdating,
    isReasonOpen,
    label,
    handleToggle,
    handleConfirmReason,
    handleCloseReason,
  } = usePatientPriority(patient);
  const { can } = usePermissions();
  const canToggle = can(Permission.VIEW_CLINICAL_RECORD);
  const action = t(isOn ? TEXT.PATIENTS.FLAGS.PRIORITY.UNMARK : TEXT.PATIENTS.FLAGS.PRIORITY.MARK);

  const reason = isOn ? getPriorityReasonText(patient.priorityReason) : null;
  const withReason = (text: string) =>
    reason ? t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_TOOLTIP, { action: text, reason }) : text;
  const patientName = getFullName(patient.firstName, patient.lastName);

  // Marcar la prioridad escribe indicadores: sin atender pacientes se ve el estado, no se cambia.
  if (!canToggle) {
    return isOn ? (
      <span
        title={withReason(label)}
        role={showLabel ? undefined : 'img'}
        aria-label={showLabel ? undefined : withReason(label)}
        className={tailwind('flex items-center gap-1.5 px-2 text-danger', className)}
      >
        <Flag className="h-4 w-4 fill-current" aria-hidden />
        {showLabel && (
          <Typography variant={TypographyVariant.HELPER} inline className="text-danger">
            {label}
          </Typography>
        )}
      </span>
    ) : null;
  }

  return (
    <>
      <Button
        variant={ButtonVariant.GHOST}
        onClick={handleToggle}
        isLoading={isUpdating}
        aria-pressed={isOn}
        title={withReason(action)}
        aria-label={withReason(
          t(TEXT.PATIENTS.FLAGS.PRIORITY.PATIENT_ACTION, {
            action,
            name: patientName,
          }),
        )}
        icon={<Flag className={tailwind('h-4 w-4', isOn && 'fill-current')} aria-hidden />}
        className={tailwind(
          'min-h-[44px] min-w-[44px] px-2 py-1.5',
          isOn ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'text-ink-500',
          className,
        )}
      />
      {isReasonOpen && (
        <PriorityReasonModal
          patientName={patientName}
          isSaving={isUpdating}
          onConfirm={handleConfirmReason}
          onClose={handleCloseReason}
        />
      )}
    </>
  );
};
