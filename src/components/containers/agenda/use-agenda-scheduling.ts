import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCreateNextAppointmentMutation } from '@/shared/api/mutations/patients/create-next-appointment-mutation';
import { useSetTentativeMonthMutation } from '@/shared/api/mutations/patients/set-tentative-month-mutation';
import { useUpdateAppointmentStatusMutation } from '@/shared/api/mutations/appointments/update-appointment-status-mutation';
import { useUpdateAppointmentTimeMutation } from '@/shared/api/mutations/appointments/update-appointment-time-mutation';
import { FETCH_APPOINTMENTS_KEY } from '@/shared/api/querys/appointments-query';
import { FETCH_APPOINTMENT_MONTHS_KEY } from '@/shared/api/querys/appointment-months-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { formatHour } from '@/shared/utils/dates';
import { EMPTY_VALUE, getFullName } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';
import { Patient } from '@/types/patients/patient';
import { buildSlotTimes, resolveSlotHour } from './agenda-presenter';

/** Algo que se está guardando: se muestra en su destino mientras tanto. */
export interface SavingItem {
  /** UUID del paciente (si venía de "Por confirmar") o de la cita. */
  id: string;
  title: string;
  /** Día y horario destino; hora null si vuelve a "Por confirmar". */
  dayKey: string;
  hour: number | null;
}

/** Lo que se refresca después de cualquier movimiento: citas, pacientes, meses y bitácora. */
const QUERIES_TO_REFRESH = [
  FETCH_APPOINTMENTS_KEY,
  FETCH_PATIENTS_KEY,
  FETCH_APPOINTMENT_MONTHS_KEY,
  FETCH_PATIENT_ACTIVITY_KEY,
];

/**
 * Confirmar, mover y devolver citas sin modal. Lo usan igual el arrastre de
 * escritorio, el "tocar paciente y tocar hora" y la ficha de confirmar del
 * celular, así que las tres formas guardan exactamente lo mismo:
 *
 * - Confirmar: `POST next-appointment` (confirma el día y limpia el mes
 *   tentativo) y después `PATCH` con la hora, porque ese POST no la recibe.
 * - Mover: solo el `PATCH` de la hora.
 * - Devolver a "por confirmar": anota el mes (el API cancela la cita futura)
 *   y cancela la de hoy cuya hora ya pasó, que el API no toca.
 */
export function useAgendaScheduling() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeCreateNextAppointmentAsync } = useCreateNextAppointmentMutation();
  const { executeUpdateAppointmentTimeAsync } = useUpdateAppointmentTimeMutation();
  const { executeSetTentativeMonthAsync } = useSetTentativeMonthMutation();
  const { executeUpdateAppointmentStatusAsync } = useUpdateAppointmentStatusMutation();

  const [savingItems, setSavingItems] = useState<SavingItem[]>([]);
  const savingIds = useMemo(() => new Set(savingItems.map((item) => item.id)), [savingItems]);

  const refresh = () =>
    Promise.all(
      QUERIES_TO_REFRESH.map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    );

  /**
   * Muestra el elemento en su destino mientras se guarda y, pase lo que pase,
   * refresca al final: si algo falló a medias, la pantalla queda como el API.
   */
  const track = async (item: SavingItem, task: () => Promise<void>) => {
    setSavingItems((items) => [...items, item]);
    try {
      await task();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t(TEXT.GENERAL.ERRORS.UNEXPECTED));
    } finally {
      await refresh();
      setSavingItems((items) => items.filter((saving) => saving.id !== item.id));
    }
  };

  const confirmPending = (patient: Patient, dayKey: string, hour: number) => {
    const name = getFullName(patient.firstName, patient.lastName);

    return track({ id: patient.uuid, title: name, dayKey, hour }, async () => {
      const appointment = await executeCreateNextAppointmentAsync({
        patientUuid: patient.uuid,
        date: dayKey,
        ...(patient.tentativeAppointmentTypeUuid && {
          typeUUID: patient.tentativeAppointmentTypeUuid,
        }),
        ...(patient.branchUuid && { branchUUID: patient.branchUuid }),
      });

      // El día ya quedó confirmado: si la hora falla, se avisa distinto para
      // que se vuelva a ubicar desde "Sin hora asignada".
      try {
        await executeUpdateAppointmentTimeAsync({
          appointmentUuid: appointment.id,
          ...buildSlotTimes(dayKey, hour),
        });
      } catch {
        toast.error(t(TEXT.AGENDA.BOARD.TOASTS.TIME_ERROR, { name }));
        return;
      }

      toast.success(t(TEXT.AGENDA.BOARD.TOASTS.CONFIRMED, { name, hour: formatHour(hour) }));
    });
  };

  const moveAppointment = (appointment: Appointment, dayKey: string, hour: number) => {
    if (resolveSlotHour(appointment) === hour) return Promise.resolve();
    const name = appointment.patientName ?? EMPTY_VALUE;

    return track({ id: appointment.id, title: name, dayKey, hour }, async () => {
      await executeUpdateAppointmentTimeAsync({
        appointmentUuid: appointment.id,
        ...buildSlotTimes(dayKey, hour),
      });
      toast.success(t(TEXT.AGENDA.BOARD.TOASTS.MOVED, { name, hour: formatHour(hour) }));
    });
  };

  const returnToPending = (appointment: Appointment, dayKey: string, monthKey: string) => {
    const name = appointment.patientName ?? EMPTY_VALUE;

    return track({ id: appointment.id, title: name, dayKey, hour: null }, async () => {
      // Primero el mes: si esto falla, la cita sigue intacta.
      await executeSetTentativeMonthAsync({
        patientUuid: appointment.patientUUID,
        month: monthKey,
        typeUUID: appointment.typeUUID,
      });
      await executeUpdateAppointmentStatusAsync({
        appointmentUuid: appointment.id,
        status: AppointmentStatus.CANCELLED,
      });
      toast.success(t(TEXT.AGENDA.BOARD.TOASTS.RETURNED, { name }));
    });
  };

  return { savingItems, savingIds, confirmPending, moveAppointment, returnToPending };
}

export type AgendaScheduling = ReturnType<typeof useAgendaScheduling>;
