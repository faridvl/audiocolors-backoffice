import React, { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_APPOINTMENT_MONTHS_KEY } from '@/shared/api/querys/appointment-months-query';
import { useCreateNextAppointmentMutation } from '@/shared/api/mutations/patients/create-next-appointment-mutation';

interface ScheduleAppointmentModalProps {
  patientUuid: string;
  onClose: () => void;
}

/** "2026-12-15" -> minimo aceptado por un input date. */
function toDateMinimum(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Modal minimo para agendar la proxima cita de un paciente: solo el dia y la
 * sede, sin hora (la fija el backend). El tipo de cita y la especialidad los
 * resuelve el backend, y si el paciente ya tenia una cita agendada la
 * reemplaza sin que haga falta avisar ni confirmar nada extra aqui.
 */
export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  patientUuid,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { data: branches } = useBranchesQuery();
  const { executeCreateNextAppointment, isPending } = useCreateNextAppointmentMutation();

  const [date, setDate] = useState('');
  const [branchUuid, setBranchUuid] = useState('');
  const [error, setError] = useState<string | null>(null);

  const minDate = toDateMinimum(new Date());

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!date) {
      setError('La fecha es obligatoria');
      return;
    }

    if (date < minDate) {
      setError('La fecha no puede ser en el pasado');
      return;
    }

    setError(null);

    executeCreateNextAppointment(
      {
        patientUuid,
        date,
        ...(branchUuid ? { branchUUID: branchUuid } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Cita agendada');
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, patientUuid] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
          // El mes de la cita recien agendada tiene que aparecer en el filtro de
          // "proxima cita" del listado, que si no se queda con la lista anterior.
          void queryClient.invalidateQueries({ queryKey: [FETCH_APPOINTMENT_MONTHS_KEY] });
          onClose();
        },
        onError: (mutationError: Error) => toast.error(mutationError.message),
      },
    );
  };

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
            <CalendarClock className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>Agendar próxima cita</Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              El tipo de cita lo asigna la clínica automáticamente.
            </Typography>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="appointment-date">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
                Fecha
                <span className="ml-0.5 text-danger">*</span>
              </Typography>
            </label>
            <input
              id="appointment-date"
              type="date"
              required
              min={minDate}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setError(null);
              }}
              className={inputBaseClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="appointment-branch">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD}>Sede</Typography>
            </label>
            <select
              id="appointment-branch"
              value={branchUuid}
              onChange={(event) => setBranchUuid(event.target.value)}
              className={inputBaseClasses}
            >
              <option value="">Sin especificar</option>
              {(branches ?? []).map((branch) => (
                <option key={branch.uuid} value={branch.uuid}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {error && <Typography variant={TypographyVariant.ERROR}>{error}</Typography>}

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
              Agendar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
