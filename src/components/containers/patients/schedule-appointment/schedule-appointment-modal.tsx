import React, { useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_APPOINTMENT_MONTHS_KEY } from '@/shared/api/querys/appointment-months-query';
import { useCreateNextAppointmentMutation } from '@/shared/api/mutations/patients/create-next-appointment-mutation';
import { useSetTentativeMonthMutation } from '@/shared/api/mutations/patients/set-tentative-month-mutation';
import { formatMonthLabel } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';

/** Cuantos meses hacia adelante se ofrecen al anotar un mes tentativo. */
const TENTATIVE_MONTHS_AHEAD = 12;

interface ScheduleAppointmentModalProps {
  patientUuid: string;
  /** Mes tentativo ya anotado, para precargar el selector. */
  tentativeMonth?: string | null;
  /** Tipo anotado junto a ese mes, para precargarlo en los dos modos. */
  tentativeTypeUuid?: string | null;
  /** Sede habitual del paciente. Se envia tal cual, no se elige en este modal. */
  branchUuid?: string | null;
  onClose: () => void;
}

/** Los dos momentos del flujo: primero se anota el mes, despues el dia. */
enum ScheduleMode {
  MONTH = 'month',
  DAY = 'day',
}

/** "2026-12-15" -> minimo aceptado por un input date. */
function toDateMinimum(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Los proximos N meses en formato YYYY-MM, empezando por el actual. */
function buildMonthOptions(count: number): string[] {
  const today = new Date();

  return Array.from({ length: count }, (_, offset) => {
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  });
}

/**
 * Modal de la proxima cita, con los dos momentos del flujo de la clinica:
 *
 * 1. **Solo el mes** — al cerrar una visita se anota el mes en que tocaria
 *    volver y de que seria, sin dia. El paciente todavia no confirma nada.
 * 2. **Dia confirmado** — recepcion llama; si el paciente acepta se fija el
 *    dia, con el tipo ya precargado del apunte tentativo (se puede cambiar), y
 *    el apunte se limpia. Si no acepta, se vuelve al modo mes con uno nuevo y
 *    el backend cancela la cita anterior. La sede es siempre la habitual del
 *    paciente, no se elige aqui.
 *
 * Los dos modos son excluyentes a proposito: un paciente no puede estar a la
 * vez con cita agendada y pendiente de confirmar. La hora la fija el backend.
 */
export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  patientUuid,
  tentativeMonth,
  tentativeTypeUuid,
  branchUuid,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { data: appointmentTypes } = useAppointmentTypesQuery();
  const { executeCreateNextAppointment, isPending: isSchedulingDay } =
    useCreateNextAppointmentMutation();
  const { executeSetTentativeMonth, isPending: isSavingMonth } = useSetTentativeMonthMutation();

  // Con un mes ya anotado el siguiente paso natural es confirmar el dia; sin
  // el, se empieza por el mes.
  const [mode, setMode] = useState<ScheduleMode>(
    tentativeMonth ? ScheduleMode.DAY : ScheduleMode.MONTH,
  );
  const [month, setMonth] = useState(tentativeMonth ?? '');
  const [date, setDate] = useState('');
  // Compartido por los dos modos: lo que se anoto con el mes es lo que se
  // propone al confirmar el dia, donde todavia se puede cambiar.
  const [typeUuid, setTypeUuid] = useState(tentativeTypeUuid ?? '');
  const [error, setError] = useState<string | null>(null);

  const minDate = toDateMinimum(new Date());
  const monthOptions = useMemo(() => buildMonthOptions(TENTATIVE_MONTHS_AHEAD), []);
  const isPending = isSchedulingDay || isSavingMonth;

  const refreshPatientData = () => {
    void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, patientUuid] });
    void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
    // El mes de la cita recien agendada tiene que aparecer en el filtro de
    // "proxima cita" del listado, que si no se queda con la lista anterior.
    void queryClient.invalidateQueries({ queryKey: [FETCH_APPOINTMENT_MONTHS_KEY] });
  };

  const handleModeChange = (nextMode: ScheduleMode) => {
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === ScheduleMode.MONTH) {
      if (!month) {
        setError('Elige el mes tentativo');
        return;
      }

      if (!typeUuid) {
        setError('El tipo de cita es obligatorio');
        return;
      }

      setError(null);

      executeSetTentativeMonth(
        { patientUuid, month, typeUUID: typeUuid },
        {
          onSuccess: () => {
            toast.success(`Próxima cita tentativa: ${formatMonthLabel(month)}`);
            refreshPatientData();
            onClose();
          },
          onError: (mutationError: Error) => toast.error(mutationError.message),
        },
      );
      return;
    }

    if (!date) {
      setError('La fecha es obligatoria');
      return;
    }

    if (date < minDate) {
      setError('La fecha no puede ser en el pasado');
      return;
    }

    if (!typeUuid) {
      setError('El tipo de cita es obligatorio');
      return;
    }

    setError(null);

    executeCreateNextAppointment(
      {
        patientUuid,
        date,
        typeUUID: typeUuid,
        ...(branchUuid ? { branchUUID: branchUuid } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Cita agendada');
          refreshPatientData();
          onClose();
        },
        onError: (mutationError: Error) => toast.error(mutationError.message),
      },
    );
  };

  const modeTabClasses = (tabMode: ScheduleMode) =>
    tailwind(
      'flex-1 rounded-lg px-3 py-2 text-sm transition-colors',
      mode === tabMode
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
            <CalendarClock className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>Próxima cita</Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {mode === ScheduleMode.MONTH
                ? 'Anota el mes en que le toca volver y de qué es. El día se define cuando el paciente confirme.'
                : 'La hora la asigna la clínica automáticamente.'}
            </Typography>
          </div>
        </div>

        <div className="mt-4 flex gap-2" role="group" aria-label="Tipo de agendamiento">
          <button
            type="button"
            onClick={() => handleModeChange(ScheduleMode.MONTH)}
            aria-pressed={mode === ScheduleMode.MONTH}
            className={modeTabClasses(ScheduleMode.MONTH)}
          >
            Solo el mes
          </button>
          <button
            type="button"
            onClick={() => handleModeChange(ScheduleMode.DAY)}
            aria-pressed={mode === ScheduleMode.DAY}
            className={modeTabClasses(ScheduleMode.DAY)}
          >
            Día confirmado
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {mode === ScheduleMode.MONTH ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="appointment-month">
                <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
                  Mes tentativo
                  <span className="ml-0.5 text-danger">*</span>
                </Typography>
              </label>
              <select
                id="appointment-month"
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                  setError(null);
                }}
                className={inputBaseClasses}
              >
                <option value="">Elegir mes</option>
                {monthOptions.map((monthKey) => (
                  <option key={monthKey} value={monthKey}>
                    {formatMonthLabel(monthKey)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
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
                min={minDate}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError(null);
                }}
                className={inputBaseClasses}
              />
            </div>
          )}

          {/* El tipo va en los dos modos: de que es la cita se sabe desde que
              se anota el mes, y al confirmar el dia llega ya precargado. */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="appointment-type">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
                Tipo de cita
                <span className="ml-0.5 text-danger">*</span>
              </Typography>
            </label>
            <select
              id="appointment-type"
              value={typeUuid}
              onChange={(event) => {
                setTypeUuid(event.target.value);
                setError(null);
              }}
              className={inputBaseClasses}
            >
              <option value="">Seleccione un tipo</option>
              {(appointmentTypes ?? []).map((appointmentType) => (
                <option key={appointmentType.uuid} value={appointmentType.uuid}>
                  {appointmentType.name}
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
              {mode === ScheduleMode.MONTH ? 'Guardar mes' : 'Agendar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
