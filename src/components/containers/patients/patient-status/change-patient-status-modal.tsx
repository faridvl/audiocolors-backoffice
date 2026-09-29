import React, { useState } from 'react';
import { UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { useUpdatePatientStatusMutation } from '@/shared/api/mutations/patients/update-patient-status-mutation';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_APPOINTMENT_MONTHS_KEY } from '@/shared/api/querys/appointment-months-query';
import { PATIENT_STATUS_LABELS, PatientStatus } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';

const REASON_MAX_LENGTH = 200;

interface ChangePatientStatusModalProps {
  patientUuid: string;
  currentStatus: PatientStatus;
  currentReason?: string | null;
  /** Fecha de fallecimiento ISO, para precargarla. */
  currentDate?: string | null;
  onClose: () => void;
}

function toDayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Cambia el estado del paciente: activo, inactivo (con motivo) o fallecido
 * (con fecha opcional). Marcar fallecido cancela sus citas futuras en el API,
 * por eso se avisa antes de guardar.
 */
export const ChangePatientStatusModal: React.FC<ChangePatientStatusModalProps> = ({
  patientUuid,
  currentStatus,
  currentReason,
  currentDate,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { executeUpdatePatientStatus, isPending } = useUpdatePatientStatusMutation();

  const [status, setStatus] = useState<PatientStatus>(currentStatus);
  const [reason, setReason] = useState(currentReason ?? '');
  const [date, setDate] = useState(currentDate ? currentDate.slice(0, 10) : '');

  const today = toDayKey(new Date());
  const isDeceased = status === PatientStatus.DECEASED;
  const wasDeceased = currentStatus === PatientStatus.DECEASED;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    executeUpdatePatientStatus(
      {
        patientUuid,
        status,
        reason: status === PatientStatus.ACTIVE ? null : reason.trim() || null,
        date: isDeceased && date ? date : null,
      },
      {
        onSuccess: () => {
          toast.success(`Estado actualizado: ${PATIENT_STATUS_LABELS[status]}`);
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, patientUuid] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_APPOINTMENT_MONTHS_KEY] });
          onClose();
        },
        onError: (mutationError: Error) => toast.error(mutationError.message),
      },
    );
  };

  const optionClasses = (option: PatientStatus) =>
    tailwind(
      'flex-1 rounded-lg px-3 py-2 text-sm transition-colors',
      status === option
        ? 'bg-brand font-medium text-white'
        : 'bg-ink-50 text-ink-700 hover:bg-ink-100',
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <UserCog className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>Estado del paciente</Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              Queda registrado en la bitácora con quién lo cambió.
            </Typography>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex gap-2" role="radiogroup" aria-label="Estado">
            {Object.values(PatientStatus).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={status === option}
                onClick={() => setStatus(option)}
                className={optionClasses(option)}
              >
                {PATIENT_STATUS_LABELS[option]}
              </button>
            ))}
          </div>

          {status !== PatientStatus.ACTIVE && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status-reason">
                <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
                  {isDeceased ? 'Nota' : 'Motivo'}{' '}
                  <span className="font-normal text-ink-400">(opcional)</span>
                </Typography>
              </label>
              <input
                id="status-reason"
                type="text"
                value={reason}
                maxLength={REASON_MAX_LENGTH}
                onChange={(event) => setReason(event.target.value)}
                placeholder={
                  isDeceased ? 'Ej. informado por la hija' : 'Ej. se mudó a otra provincia'
                }
                className={inputBaseClasses}
              />
            </div>
          )}

          {isDeceased && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status-date">
                <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
                  Fecha de fallecimiento{' '}
                  <span className="font-normal text-ink-400">(opcional)</span>
                </Typography>
              </label>
              <input
                id="status-date"
                type="date"
                max={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputBaseClasses}
              />
            </div>
          )}

          {isDeceased && !wasDeceased && (
            <Typography
              variant={TypographyVariant.HELPER}
              className="rounded-lg bg-warning/10 px-3 py-2 text-ink-700"
            >
              Se cancelarán sus citas agendadas y el mes tentativo, y ya no se le podrán agendar
              citas mientras esté marcado como fallecido.
            </Typography>
          )}

          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant={ButtonVariant.SECONDARY}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isPending}>
              Guardar estado
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
