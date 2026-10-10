import {
  addMinutes,
  atHour,
  firstDayOfMonth,
  toMonthKey,
  weekdayIndex,
} from '@/shared/utils/dates';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';

/**
 * Grupos del día. Hoy y los días pasados se leen como una fila de llegada
 * (por llegar → en sala → atendidas); un día futuro solo tiene agendadas.
 * En el celular no se agrupa por hora; en escritorio las citas además se
 * reparten en horarios (ver `resolveSlotHour`).
 */
export enum AgendaSection {
  IN_ROOM = 'IN_ROOM',
  UPCOMING = 'UPCOMING',
  SCHEDULED = 'SCHEDULED',
  UNMARKED = 'UNMARKED',
  DONE = 'DONE',
}

/** Dónde cae un día respecto de hoy: define qué grupos y botones aplican. */
export enum DayTiming {
  PAST = 'PAST',
  TODAY = 'TODAY',
  FUTURE = 'FUTURE',
}

export interface AgendaGroup {
  section: AgendaSection;
  appointments: Appointment[];
}

export function getDayTiming(dayKey: string, todayKey: string): DayTiming {
  if (dayKey === todayKey) return DayTiming.TODAY;
  return dayKey < todayKey ? DayTiming.PAST : DayTiming.FUTURE;
}

/**
 * Antes de este cambio el API reagendaba marcando la cita vieja como
 * COMPLETED en vez de CANCELLED. Esas citas se reconocen porque se "completaron"
 * antes de su propia fecha; en la agenda no se muestran, porque el paciente
 * nunca vino ese día.
 */
function isReplacedByReschedule(appointment: Appointment): boolean {
  return (
    appointment.status === AppointmentStatus.COMPLETED &&
    new Date(appointment.updatedAt).getTime() < new Date(appointment.schedule.startTime).getTime()
  );
}

/** Si la cita aparece en la agenda. Las canceladas y las reemplazadas no. */
export function isVisibleInAgenda(appointment: Appointment): boolean {
  if (appointment.status === AppointmentStatus.CANCELLED) return false;
  if (appointment.status === AppointmentStatus.TENTATIVE) return false;
  return !isReplacedByReschedule(appointment);
}

export function resolveSection(appointment: Appointment, timing: DayTiming): AgendaSection {
  if (timing === DayTiming.FUTURE) return AgendaSection.SCHEDULED;

  switch (appointment.status) {
    case AppointmentStatus.WAITING:
      return AgendaSection.IN_ROOM;
    case AppointmentStatus.COMPLETED:
      return AgendaSection.DONE;
    // EXPIRED no significa "no vino": solo que nadie la marcó antes de la
    // medianoche. Por eso se muestra como "sin marcar" y se puede corregir.
    case AppointmentStatus.EXPIRED:
      return AgendaSection.UNMARKED;
    default:
      return timing === DayTiming.TODAY ? AgendaSection.UPCOMING : AgendaSection.UNMARKED;
  }
}

/** Orden en pantalla: lo que pide acción primero, lo resuelto al final. */
const SECTION_ORDER: AgendaSection[] = [
  AgendaSection.IN_ROOM,
  AgendaSection.UPCOMING,
  AgendaSection.SCHEDULED,
  AgendaSection.UNMARKED,
  AgendaSection.DONE,
];

export function groupAppointments(appointments: Appointment[], timing: DayTiming): AgendaGroup[] {
  const bySection = new Map<AgendaSection, Appointment[]>();

  for (const appointment of appointments) {
    const section = resolveSection(appointment, timing);
    bySection.set(section, [...(bySection.get(section) ?? []), appointment]);
  }

  return SECTION_ORDER.filter((section) => bySection.has(section)).map((section) => ({
    section,
    appointments: [...(bySection.get(section) ?? [])].sort((first, second) =>
      (first.patientName ?? '').localeCompare(second.patientName ?? '', 'es'),
    ),
  }));
}

/** Lo que se puede hacer con una cita desde su ficha. */
export enum AppointmentAction {
  MARK_ARRIVED = 'MARK_ARRIVED',
  MARK_DONE = 'MARK_DONE',
  UNDO_ARRIVED = 'UNDO_ARRIVED',
  /** Poner o cambiar la hora: en el celular no hay horarios para arrastrar. */
  SET_TIME = 'SET_TIME',
  RESCHEDULE = 'RESCHEDULE',
  WHATSAPP = 'WHATSAPP',
  CALENDAR = 'CALENDAR',
  /** Deshace la confirmación: vuelve a quedar solo el mes (lo mismo que arrastrarla a "Por confirmar"). */
  RETURN_TO_PENDING = 'RETURN_TO_PENDING',
}

/**
 * Acción principal (el botón grande de la ficha) y las secundarias. Los
 * estados solo se marcan hoy o hacia atrás: marcar una cita futura como
 * atendida le quitaría al paciente su próxima cita en el listado.
 */
export function resolveAppointmentActions(
  appointment: Appointment,
  timing: DayTiming,
): { primary: AppointmentAction | null; secondary: AppointmentAction[] } {
  const canMove = canMoveAppointment(appointment, timing);
  const contactActions = [
    ...(canMove ? [AppointmentAction.SET_TIME] : []),
    AppointmentAction.RESCHEDULE,
    AppointmentAction.WHATSAPP,
    AppointmentAction.CALENDAR,
    ...(canMove ? [AppointmentAction.RETURN_TO_PENDING] : []),
  ];

  if (appointment.status === AppointmentStatus.COMPLETED) return { primary: null, secondary: [] };
  if (timing === DayTiming.FUTURE) return { primary: null, secondary: contactActions };

  if (appointment.status === AppointmentStatus.WAITING) {
    return { primary: AppointmentAction.MARK_DONE, secondary: [AppointmentAction.UNDO_ARRIVED] };
  }

  const section = resolveSection(appointment, timing);
  if (section === AgendaSection.UPCOMING) {
    return {
      primary: AppointmentAction.MARK_ARRIVED,
      secondary: [AppointmentAction.MARK_DONE, ...contactActions],
    };
  }

  // Sin marcar (hoy después de medianoche UTC, o un día pasado): lo único que
  // queda por hacer es corregirla a atendida.
  return { primary: AppointmentAction.MARK_DONE, secondary: [] };
}

/**
 * Horarios de la vista de escritorio, en hora de la clínica: uno por hora, de
 * 8:00 a 17:00. El tope no es solo de negocio: el API filtra las citas por
 * día UTC, y en Costa Rica (UTC-6) una cita a las 18:00 ya cae en el día UTC
 * siguiente y desaparecería de su día.
 */
export enum SlotHour {
  FIRST = 8,
  LAST = 17,
}

/** Mismo largo que usa el API al crear la cita. */
export const SLOT_DURATION_MINUTES = 30;

export function buildSlotHours(): number[] {
  return Array.from(
    { length: SlotHour.LAST - SlotHour.FIRST + 1 },
    (_, offset) => SlotHour.FIRST + offset,
  );
}

/**
 * Horario de una cita, o null si no tiene uno. Las citas confirmadas desde el
 * modal (solo día) quedan a las 08:00 UTC, que en la clínica son las 2:00:
 * fuera de los horarios, así que se leen como "sin hora".
 */
export function resolveSlotHour(appointment: Appointment): number | null {
  const hour = new Date(appointment.schedule.startTime).getHours();
  return hour >= SlotHour.FIRST && hour <= SlotHour.LAST ? hour : null;
}

/** Inicio y fin (ISO) de un horario de un día, en la hora local de la clínica. */
export function buildSlotTimes(
  dayKey: string,
  hour: number,
): { startTime: string; endTime: string } {
  const start = atHour(dayKey, hour);
  return {
    startTime: start.toISOString(),
    endTime: addMinutes(start, SLOT_DURATION_MINUTES).toISOString(),
  };
}

/**
 * Solo una cita confirmada de hoy en adelante se puede mover de horario o
 * devolver a "por confirmar": una que ya llegó o se atendió es historia.
 */
export function canMoveAppointment(appointment: Appointment, timing: DayTiming): boolean {
  return timing !== DayTiming.PAST && appointment.status === AppointmentStatus.CONFIRMED;
}

/** De qué lado del calendario se abre la ventana de horarios. */
export enum DayPanelSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

/** Desde el jueves (columna 3) el día está en la mitad derecha del calendario. */
const RIGHT_HALF_FIRST_WEEKDAY = 3;

/** La ventana se abre del lado contrario al día, para no tapar lo que se tocó. */
export function resolveDayPanelSide(dayKey: string): DayPanelSide {
  return weekdayIndex(dayKey) >= RIGHT_HALF_FIRST_WEEKDAY ? DayPanelSide.LEFT : DayPanelSide.RIGHT;
}

/**
 * Día que propone la ficha de confirmar para un mes tentativo: hoy si el mes
 * es el actual o ya pasó (no se agenda hacia atrás); si es futuro, su día 1.
 */
export function resolveInitialConfirmDay(
  monthKey: string | null | undefined,
  todayKey: string,
): string {
  if (!monthKey || monthKey <= toMonthKey(todayKey)) return todayKey;
  return firstDayOfMonth(monthKey);
}

/**
 * Un color por sede distinta con citas ese día (una sede con cinco citas es un
 * solo punto). `resolveColor` da el color de marca de la sede, o undefined si
 * no tiene: ese punto sale gris.
 */
export function collectBranchColors(
  appointments: Appointment[],
  resolveColor: (branchUuid?: string | null) => string | undefined,
): (string | undefined)[] {
  const branchUuids = [
    ...new Set(appointments.map((appointment) => appointment.branchUUID ?? null)),
  ];
  return branchUuids.map((branchUuid) => resolveColor(branchUuid));
}
