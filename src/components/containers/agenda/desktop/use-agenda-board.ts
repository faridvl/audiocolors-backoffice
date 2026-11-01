import React, { useMemo, useState } from 'react';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { Appointment } from '@/types/appointments/appointment';
import { Patient } from '@/types/patients/patient';
import {
  buildTimelineBlocks,
  canMoveAppointment,
  DayTiming,
  resolveAppointmentDuration,
  resolveSlotHour,
  resolveTypeDuration,
} from '../agenda-presenter';
import {
  deferFromDragEvent,
  AgendaDragKind,
  AgendaDragPayload,
  isAgendaDrag,
  markAgendaDrag,
} from '../agenda-drag';
import { RowDragProps } from '../agenda-list-row';
import { SavingItem } from '../use-agenda-scheduling';
import { AgendaState } from '../use-agenda';

/**
 * Agendar en escritorio, de dos formas que conviven:
 *
 * - Arrastrar (mouse): un paciente de "Por confirmar" a un horario lo
 *   confirma; una cita a otro horario la mueve; una cita a "Por confirmar" la
 *   devuelve. Soltar es la confirmación, sin modal.
 * - Tocar y tocar (dedo, iPad, o quien no arrastra): tocar un paciente lo
 *   marca y tocar un horario del día abierto lo confirma ahí.
 *
 * Guardar es igual en las dos: lo hace `useAgendaScheduling`. Las citas que
 * se cruzan conviven lado a lado; no se bloquea a nadie por hora ocupada.
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
    branchFilter,
    scheduling,
  } = agenda;
  const { savingItems, savingIds } = scheduling;
  const { data: appointmentTypes } = useAppointmentTypesQuery();
  const isDayOpen = selectedTiming !== DayTiming.PAST;

  const durationOf = (typeUuid?: string | null) => resolveTypeDuration(appointmentTypes, typeUuid);

  const blocks = useMemo(
    () =>
      buildTimelineBlocks(
        selectedAppointments.filter((appointment) => !savingIds.has(appointment.id)),
        (appointment) => resolveTypeDuration(appointmentTypes, appointment.typeUUID),
      ),
    [selectedAppointments, savingIds, appointmentTypes],
  );

  const savingOnDay = savingItems.filter(
    (item): item is SavingItem & { startMinute: number } =>
      item.dayKey === selectedDayKey && item.startMinute !== null,
  );

  const unscheduledAppointments = useMemo(
    () =>
      selectedAppointments.filter(
        (appointment) => !savingIds.has(appointment.id) && resolveSlotHour(appointment) === null,
      ),
    [selectedAppointments, savingIds],
  );

  const returningItems = savingItems.filter((item) => item.startMinute === null);

  const selectedPending = pendingPatients.find((patient) => patient.uuid === selectedPendingUuid);

  const findPayloadTarget = (payload: AgendaDragPayload) =>
    payload.kind === AgendaDragKind.PENDING
      ? { patient: pendingPatients.find((patient) => patient.uuid === payload.id) }
      : { appointment: selectedAppointments.find((appointment) => appointment.id === payload.id) };

  /** Cuánto dura lo que se arrastra: la sombra de soltar tiene ese largo. */
  const draggingDuration = (() => {
    if (!dragging) return null;
    const { patient, appointment } = findPayloadTarget(dragging);
    if (patient) return durationOf(patient.tentativeAppointmentTypeUuid);
    return appointment ? resolveAppointmentDuration(appointment, appointmentTypes) : null;
  })();

  const handleDropAt = (startMinute: number) => {
    const payload = dragging;
    setDragging(null);
    if (!payload) return;

    const { patient, appointment } = findPayloadTarget(payload);
    deferFromDragEvent(() => {
      if (patient) {
        void scheduling.confirmPending(patient, selectedDayKey, startMinute, branchFilter);
      }
      if (appointment && canMoveAppointment(appointment, selectedTiming)) {
        void scheduling.moveAppointment(appointment, selectedDayKey, startMinute);
      }
    });
  };

  const handleDropOnPending = () => {
    const payload = dragging;
    setDragging(null);
    if (payload?.kind !== AgendaDragKind.APPOINTMENT) return;

    const { appointment } = findPayloadTarget(payload);
    if (appointment && canMoveAppointment(appointment, selectedTiming)) {
      // Vuelve a la lista donde se soltó: el mes que muestra "Por confirmar".
      deferFromDragEvent(
        () => void scheduling.returnToPending(appointment, selectedDayKey, pendingMonthKey),
      );
    }
  };

  /** La línea de tiempo recibe cualquier cosa de la agenda, pero solo de hoy en adelante. */
  const acceptsOnTimeline = (event: React.DragEvent) => isDayOpen && isAgendaDrag(event);

  /** "Por confirmar" solo recibe citas: un paciente pendiente ya está ahí. */
  const acceptsOnPending = (event: React.DragEvent) =>
    dragging?.kind === AgendaDragKind.APPOINTMENT && isAgendaDrag(event);

  const buildDrag = (payload: AgendaDragPayload): RowDragProps => ({
    onDragStart: (event) => {
      markAgendaDrag(event, payload);
      deferFromDragEvent(() => {
        setDragging(payload);
        // Arrastrar reemplaza a la selección: no quedan dos intenciones a la vez.
        setSelectedPendingUuid(null);
      });
    },
    // También diferido: así nunca corre antes que el `setDragging` de arriba.
    onDragEnd: () => deferFromDragEvent(() => setDragging(null)),
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

  /** La fila que se está arrastrando se atenúa en su lugar: se ve qué se mueve. */
  const isDragSource = (id: string) => dragging?.id === id;

  /** Tocar la línea de tiempo con un paciente marcado lo confirma ahí. */
  const handleTapAt = (startMinute: number) => {
    if (!selectedPending || !isDayOpen) return;
    void scheduling.confirmPending(selectedPending, selectedDayKey, startMinute, branchFilter);
    setSelectedPendingUuid(null);
  };

  return {
    isDayOpen,
    isDragging: dragging !== null,
    isDraggingAppointment: dragging?.kind === AgendaDragKind.APPOINTMENT,
    blocks,
    savingOnDay,
    draggingDuration,
    unscheduledAppointments,
    returningItems,
    selectedPending,
    acceptsOnTimeline,
    acceptsOnPending,
    handleDropAt,
    handleDropOnPending,
    dragPending,
    dragAppointment,
    handleTogglePending,
    handleClearSelection,
    handleTapAt,
    isDragSource,
  };
}

export type AgendaBoardState = ReturnType<typeof useAgendaBoard>;
