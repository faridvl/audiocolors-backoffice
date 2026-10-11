import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_APPOINTMENT_MONTHS_KEY } from '@/shared/api/querys/appointment-months-query';
import { FETCH_APPOINTMENTS_KEY } from '@/shared/api/querys/appointments-query';
import { useCreateNextAppointmentMutation } from '@/shared/api/mutations/patients/create-next-appointment-mutation';
import { useSetTentativeMonthMutation } from '@/shared/api/mutations/patients/set-tentative-month-mutation';
import { useClearNextAppointmentMutation } from '@/shared/api/mutations/patients/clear-next-appointment-mutation';
import { useUpdateAppointmentTimeMutation } from '@/shared/api/mutations/appointments/update-appointment-time-mutation';
import {
  buildSlotHours,
  buildSlotTimes,
  toSlotHour,
} from '@/components/containers/agenda/agenda-presenter';
import { formatDate, formatMonthLabel } from '@/shared/utils/formatters';
import { formatHour, resolveInitialConfirmDay, toDayKey, toMonthKey } from '@/shared/utils/dates';
import { TEXT } from '@/static/texts/i18n';

/** Los dos momentos del flujo: primero se anota el mes, despues el dia. */
export enum ScheduleMode {
  MONTH = 'month',
  DAY = 'day',
  /** Sin próxima cita: quita el mes tentativo y cancela la cita agendada. */
  NONE = 'none',
}

export interface ScheduleAppointmentOptions {
  patientUuid: string;
  tentativeMonth?: string | null;
  tentativeTypeUuid?: string | null;
  branchUuid?: string | null;
  nextAppointmentAt?: string | null;
  nextAppointmentTypeName?: string | null;
  initialMode?: ScheduleMode;
  onClose: () => void;
}

export function useScheduleAppointment({
  patientUuid,
  tentativeMonth,
  tentativeTypeUuid,
  branchUuid,
  nextAppointmentAt,
  nextAppointmentTypeName,
  initialMode,
  onClose,
}: ScheduleAppointmentOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: appointmentTypes, isSuccess: hasLoadedAppointmentTypes } =
    useAppointmentTypesQuery();
  const hasNoAppointmentTypes = hasLoadedAppointmentTypes && !appointmentTypes?.length;
  const { executeCreateNextAppointmentAsync } = useCreateNextAppointmentMutation();
  const { executeUpdateAppointmentTimeAsync } = useUpdateAppointmentTimeMutation();
  const { executeSetTentativeMonth, isPending: isSavingMonth } = useSetTentativeMonthMutation();
  const { executeClearNextAppointment, isPending: isClearingAppointment } =
    useClearNextAppointmentMutation();
  // Crear la cita y fijarle la hora son dos llamadas: el pendiente cubre las dos.
  const [isSchedulingDay, setIsSchedulingDay] = useState(false);
  const hasNextAppointment = Boolean(tentativeMonth || nextAppointmentAt);

  // Con un mes ya anotado el siguiente paso natural es confirmar el dia; sin
  // el, se empieza por el mes.
  const [mode, setMode] = useState<ScheduleMode>(
    initialMode ?? (tentativeMonth ? ScheduleMode.DAY : ScheduleMode.MONTH),
  );
  const [month, setMonth] = useState(tentativeMonth ?? '');
  // El día arranca dentro del mes anotado: el selector nativo no abre en un mes sin valor.
  const [date, setDate] = useState(() => {
    const todayKey = toDayKey(new Date());
    if (tentativeMonth) return resolveInitialConfirmDay(tentativeMonth, todayKey);
    if (!nextAppointmentAt) return '';
    const scheduledDay = toDayKey(new Date(nextAppointmentAt));
    return scheduledDay >= todayKey ? scheduledDay : todayKey;
  });
  const [hour, setHour] = useState<number | null>(() =>
    nextAppointmentAt ? toSlotHour(nextAppointmentAt) : null,
  );
  // Compartido por los dos modos: lo que se anoto con el mes es lo que se
  // propone al confirmar el dia, donde todavia se puede cambiar.
  const [typeUuid, setTypeUuid] = useState(tentativeTypeUuid ?? '');
  const [error, setError] = useState<string | null>(null);

  // Al reagendar una cita confirmada el API da el tipo solo por nombre.
  const selectedTypeUuid =
    typeUuid || appointmentTypes?.find((type) => type.name === nextAppointmentTypeName)?.uuid || '';
  const currentSummary = tentativeMonth
    ? [
        t(TEXT.PATIENTS.SCHEDULE.TENTATIVE_SUMMARY, {
          month: formatMonthLabel(tentativeMonth),
        }),
        appointmentTypes?.find((type) => type.uuid === tentativeTypeUuid)?.name,
      ]
        .filter(Boolean)
        .join(' · ')
    : nextAppointmentAt
      ? [
          t(TEXT.PATIENTS.SCHEDULE.SCHEDULED_SUMMARY, {
            date: formatDate(nextAppointmentAt),
          }),
          nextAppointmentTypeName,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  const todayKey = toDayKey(new Date());
  const currentMonth = toMonthKey(todayKey);
  const isPending = isSchedulingDay || isSavingMonth || isClearingAppointment;

  const refreshPatientData = () => {
    void queryClient.invalidateQueries({
      queryKey: [FETCH_PATIENT_KEY, patientUuid],
    });
    void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
    // El mes de la cita recien agendada tiene que aparecer en el filtro de
    // "proxima cita" del listado, que si no se queda con la lista anterior.
    void queryClient.invalidateQueries({
      queryKey: [FETCH_APPOINTMENT_MONTHS_KEY],
    });
    // La agenda lee las mismas citas: la nueva tiene que aparecer en su dia,
    // y la anterior (cancelada por el API) desaparecer del suyo.
    void queryClient.invalidateQueries({ queryKey: [FETCH_APPOINTMENTS_KEY] });
  };

  const handleModeChange = (nextMode: ScheduleMode) => {
    setMode(nextMode);
    setError(null);
  };

  const handleMonthChange = (monthKey: string) => {
    setMonth(monthKey);
    setError(null);
  };

  const handleDateChange = (dayKey: string) => {
    setDate(dayKey);
    setError(null);
  };

  /** Vacío = sin hora: la cita queda solo con el día y la hora se pone después en la agenda. */
  const handleHourChange = (value: string) => setHour(value === '' ? null : Number(value));

  const handleTypeChange = (nextTypeUuid: string) => {
    setTypeUuid(nextTypeUuid);
    setError(null);
  };

  const handleBack = () => handleModeChange(tentativeMonth ? ScheduleMode.DAY : ScheduleMode.MONTH);

  const clearAppointment = () =>
    executeClearNextAppointment(
      { patientUuid, tentativeMonth, nextAppointmentAt },
      {
        onSuccess: () => {
          toast.success(t(TEXT.PATIENTS.SCHEDULE.TOASTS.CLEARED));
          refreshPatientData();
          onClose();
        },
        onError: (mutationError: Error) => {
          // Si falló a medias (cita cancelada, mes no), la pantalla queda como el API.
          refreshPatientData();
          toast.error(mutationError.message);
        },
      },
    );

  const saveTentativeMonth = () => {
    if (!month) {
      setError(t(TEXT.PATIENTS.SCHEDULE.VALIDATION.MONTH_REQUIRED));
      return;
    }
    if (!selectedTypeUuid) {
      setError(t(TEXT.PATIENTS.SCHEDULE.VALIDATION.TYPE_REQUIRED));
      return;
    }
    setError(null);

    executeSetTentativeMonth(
      { patientUuid, month, typeUUID: selectedTypeUuid },
      {
        onSuccess: () => {
          toast.success(
            t(TEXT.PATIENTS.SCHEDULE.TOASTS.TENTATIVE, {
              month: formatMonthLabel(month),
            }),
          );
          refreshPatientData();
          onClose();
        },
        onError: (mutationError: Error) => toast.error(mutationError.message),
      },
    );
  };

  /**
   * `POST next-appointment` solo recibe el día; la hora se fija después con
   * el mismo PATCH que usa la agenda al arrastrar.
   */
  const scheduleDay = async () => {
    if (!date) {
      setError(t(TEXT.PATIENTS.SCHEDULE.VALIDATION.DATE_REQUIRED));
      return;
    }
    if (date < todayKey) {
      setError(t(TEXT.PATIENTS.SCHEDULE.VALIDATION.DATE_PAST));
      return;
    }
    if (!selectedTypeUuid) {
      setError(t(TEXT.PATIENTS.SCHEDULE.VALIDATION.TYPE_REQUIRED));
      return;
    }
    setError(null);
    setIsSchedulingDay(true);

    try {
      const appointment = await executeCreateNextAppointmentAsync({
        patientUuid,
        date,
        typeUUID: selectedTypeUuid,
        ...(branchUuid ? { branchUUID: branchUuid } : {}),
      });

      if (hour === null) {
        toast.success(t(TEXT.PATIENTS.SCHEDULE.TOASTS.SCHEDULED));
      } else {
        try {
          await executeUpdateAppointmentTimeAsync({
            appointmentUuid: appointment.id,
            ...buildSlotTimes(date, hour),
          });
          toast.success(
            t(TEXT.PATIENTS.SCHEDULE.TOASTS.SCHEDULED_AT, {
              hour: formatHour(hour),
            }),
          );
        } catch {
          // El día ya quedó: se avisa distinto para que la hora se ponga desde la agenda.
          toast.error(t(TEXT.PATIENTS.SCHEDULE.TOASTS.TIME_ERROR));
        }
      }
      onClose();
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error ? mutationError.message : t(TEXT.GENERAL.ERRORS.UNEXPECTED),
      );
    } finally {
      refreshPatientData();
      setIsSchedulingDay(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === ScheduleMode.NONE) clearAppointment();
    else if (mode === ScheduleMode.MONTH) saveTentativeMonth();
    else void scheduleDay();
  };

  return {
    mode,
    month,
    date,
    hour,
    hourOptions: buildSlotHours().map((slotHour) => ({
      value: String(slotHour),
      label: formatHour(slotHour),
    })),
    selectedTypeUuid,
    appointmentTypes: appointmentTypes ?? [],
    hasNoAppointmentTypes,
    hasNextAppointment,
    currentSummary,
    currentMonth,
    minDate: todayKey,
    error,
    isPending,
    handleModeChange,
    handleMonthChange,
    handleDateChange,
    handleHourChange,
    handleTypeChange,
    handleBack,
    handleSubmit,
  };
}
