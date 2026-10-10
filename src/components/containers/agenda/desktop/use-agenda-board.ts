import React, { useMemo, useState } from 'react';
import { formatHour } from '@/shared/utils/dates';
import { Appointment } from '@/types/appointments/appointment';
import { Patient } from '@/types/patients/patient';
import {
  buildSlotHours,
  canMoveAppointment,
  DayTiming,
  resolveSlotHour,
} from '../agenda-presenter';
import { AgendaDragKind, AgendaDragPayload, isAgendaDrag, markAgendaDrag } from '../agenda-drag';
import { RowDragProps } from '../agenda-list-row';
import { SavingItem } from '../use-agenda-scheduling';
import { AgendaState } from '../use-agenda';

export interface BoardSlot {
  hour: number;
  label: string;
  appointments: Appointment[];
  saving: SavingItem[];
}

/**
 * Agendar en escritorio, de dos formas que conviven:
 *
 * - Arrastrar (mouse): un paciente de "Por confirmar" a un horario lo
 *   confirma; una cita a otro horario la mueve; una cita a "Por confirmar" la
 *   devuelve. Soltar es la confirmación, sin modal.
 * - Tocar y tocar (dedo, iPad, o quien no arrastra): tocar un paciente lo
 *   marca y tocar un horario del día abierto lo confirma ahí.
 *
 * Guardar es igual en las dos: lo hace `useAgendaScheduling`. Un horario
 * acepta varias citas; no se bloquea a nadie por hora ocupada.
 */
export function useAgendaBoard(agenda: AgendaState) {
  const [dragging, setDragging] = useState<AgendaDragPayload | null>(null);
  const [selectedPendingUuid, setSelectedPendingUuid] = useState<string | null>(null);

  const {
    selectedDayKey,
    selectedTiming,
    selectedAppointments,
    pendingPatients,
    pendingMonthKey,
    scheduling,
  } = agenda;
  const { savingItems, savingIds } = scheduling;
  const isDayOpen = selectedTiming !== DayTiming.PAST;

  const slots: BoardSlot[] = useMemo(
    () =>
      buildSlotHours().map((hour) => ({
        hour,
        label: formatHour(hour),
        appointments: selectedAppointments.filter(
          (appointment) => !savingIds.has(appointment.id) && resolveSlotHour(appointment) === hour,
        ),
        saving: savingItems.filter((item) => item.dayKey === selectedDayKey && item.hour === hour),
      })),
    [selectedAppointments, savingIds, savingItems, selectedDayKey],
  );

  const unscheduledAppointments = useMemo(
    () =>
      selectedAppointments.filter(
        (appointment) => !savingIds.has(appointment.id) && resolveSlotHour(appointment) === null,
      ),
    [selectedAppointments, savingIds],
  );

  const returningItems = savingItems.filter((item) => item.hour === null);

  const selectedPending = pendingPatients.find((patient) => patient.uuid === selectedPendingUuid);

  const findPayloadTarget = (payload: AgendaDragPayload) =>
    payload.kind === AgendaDragKind.PENDING
      ? { patient: pendingPatients.find((patient) => patient.uuid === payload.id) }
      : { appointment: selectedAppointments.find((appointment) => appointment.id === payload.id) };

  const handleDropOnSlot = (hour: number) => {
    const payload = dragging;
    setDragging(null);
    if (!payload) return;

    const { patient, appointment } = findPayloadTarget(payload);
    if (patient) void scheduling.confirmPending(patient, selectedDayKey, hour);
    if (appointment && canMoveAppointment(appointment, selectedTiming)) {
      void scheduling.moveAppointment(appointment, selectedDayKey, hour);
    }
  };

  const handleDropOnPending = () => {
    const payload = dragging;
    setDragging(null);
    if (payload?.kind !== AgendaDragKind.APPOINTMENT) return;

    const { appointment } = findPayloadTarget(payload);
    if (appointment && canMoveAppointment(appointment, selectedTiming)) {
      // Vuelve a la lista donde se soltó: el mes que muestra "Por confirmar".
      void scheduling.returnToPending(appointment, selectedDayKey, pendingMonthKey);
    }
  };

  /** Un horario recibe cualquier cosa de la agenda, pero solo de hoy en adelante. */
  const acceptsOnSlot = (event: React.DragEvent) => isDayOpen && isAgendaDrag(event);

  /** "Por confirmar" solo recibe citas: un paciente pendiente ya está ahí. */
  const acceptsOnPending = (event: React.DragEvent) =>
    dragging?.kind === AgendaDragKind.APPOINTMENT && isAgendaDrag(event);

  const buildDrag = (payload: AgendaDragPayload): RowDragProps => ({
    onDragStart: (event) => {
      markAgendaDrag(event, payload);
      setDragging(payload);
      // Arrastrar reemplaza a la selección: no quedan dos intenciones a la vez.
      setSelectedPendingUuid(null);
    },
    onDragEnd: () => setDragging(null),
  });

  const dragPending = (patient: Patient): RowDragProps =>
    buildDrag({ kind: AgendaDragKind.PENDING, id: patient.uuid });

  const dragAppointment = (appointment: Appointment): RowDragProps | undefined =>
    canMoveAppointment(appointment, selectedTiming)
      ? buildDrag({ kind: AgendaDragKind.APPOINTMENT, id: appointment.id })
      : undefined;

  /** Tocar un paciente lo marca; tocarlo de nuevo lo desmarca. */
  const handleTogglePending = (patient: Patient) =>
    setSelectedPendingUuid((current) => (current === patient.uuid ? null : patient.uuid));

  const handleClearSelection = () => setSelectedPendingUuid(null);

  /** Tocar un horario con un paciente marcado lo confirma ahí. */
  const handleTapSlot = (hour: number) => {
    if (!selectedPending || !isDayOpen) return;
    void scheduling.confirmPending(selectedPending, selectedDayKey, hour);
    setSelectedPendingUuid(null);
  };

  return {
    isDayOpen,
    isDragging: dragging !== null,
    isDraggingAppointment: dragging?.kind === AgendaDragKind.APPOINTMENT,
    slots,
    unscheduledAppointments,
    returningItems,
    selectedPending,
    acceptsOnSlot,
    acceptsOnPending,
    handleDropOnSlot,
    handleDropOnPending,
    dragPending,
    dragAppointment,
    handleTogglePending,
    handleClearSelection,
    handleTapSlot,
  };
}

export type AgendaBoardState = ReturnType<typeof useAgendaBoard>;
