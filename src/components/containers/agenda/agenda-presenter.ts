import {
  addMinutes,
  atMinute,
  firstDayOfMonth,
  MINUTE_IN_MS,
  MINUTES_IN_HOUR,
  toMinuteOfDay,
  toMonthKey,
  weekdayIndex,
} from '@/shared/utils/dates';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';
import { AppointmentType } from '@/types/appointments/appointment-type';

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

/** Largo de una cita cuyo tipo no tiene duración: el mismo que usa el API al crearla. */
export const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

/** Duración de un tipo de cita (dato de la clínica en el API), o la de por defecto. */
export function resolveTypeDuration(
  appointmentTypes: AppointmentType[] | undefined,
  typeUuid: string | null | undefined,
): number {
  const type = appointmentTypes?.find((appointmentType) => appointmentType.uuid === typeUuid);
  return type?.duration ?? DEFAULT_APPOINTMENT_DURATION_MINUTES;
}

/**
 * Cuánto dura una cita ya guardada: la que tiene, o la de su tipo si no tiene
 * hora real (las confirmadas solo con día). Mover una cita no la alarga ni la acorta.
 */
export function resolveAppointmentDuration(
  appointment: Appointment,
  appointmentTypes: AppointmentType[] | undefined,
): number {
  const savedMinutes =
    (new Date(appointment.schedule.endTime).getTime() -
      new Date(appointment.schedule.startTime).getTime()) /
    MINUTE_IN_MS;
  return resolveSlotHour(appointment) !== null && savedMinutes > 0
    ? savedMinutes
    : resolveTypeDuration(appointmentTypes, appointment.typeUUID);
}

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
  return toSlotHour(appointment.schedule.startTime);
}

/** Horario de una fecha ISO, o null si cae fuera de los horarios. */
export function toSlotHour(isoDate: string): number | null {
  const hour = new Date(isoDate).getHours();
  return hour >= SlotHour.FIRST && hour <= SlotHour.LAST ? hour : null;
}

/** Inicio y fin (ISO) de una cita que empieza en un minuto del día, en la hora local de la clínica. */
export function buildSlotTimes(
  dayKey: string,
  startMinute: number,
  durationMinutes: number,
): { startTime: string; endTime: string } {
  const start = atMinute(dayKey, startMinute);
  return {
    startTime: start.toISOString(),
    endTime: addMinutes(start, durationMinutes).toISOString(),
  };
}

/** La línea de tiempo del día va de la primera hora al final de la última. */
export const TIMELINE_START_MINUTE = SlotHour.FIRST * MINUTES_IN_HOUR;
export const TIMELINE_END_MINUTE = (SlotHour.LAST + 1) * MINUTES_IN_HOUR;
/** Soltar o tocar la línea de tiempo cae en la media hora más cercana. */
export const TIMELINE_STEP_MINUTES = 30;

/** Minuto del día en que empieza una cita, o null si no tiene hora (ver `resolveSlotHour`). */
export function resolveStartMinute(appointment: Appointment): number | null {
  return resolveSlotHour(appointment) === null
    ? null
    : toMinuteOfDay(appointment.schedule.startTime);
}

/**
 * Minuto (relativo al inicio de la línea de tiempo) → media hora donde cae,
 * sin salirse del día: la última empieza media hora antes del cierre.
 */
export function snapToTimelineStep(offsetMinutes: number): number {
  const step = Math.floor(offsetMinutes / TIMELINE_STEP_MINUTES) * TIMELINE_STEP_MINUTES;
  const lastStart = TIMELINE_END_MINUTE - TIMELINE_STEP_MINUTES;
  return Math.min(lastStart, Math.max(TIMELINE_START_MINUTE, TIMELINE_START_MINUTE + step));
}

export interface TimelineBlock {
  appointment: Appointment;
  startMinute: number;
  endMinute: number;
  /** Columna dentro de su grupo de citas que se cruzan, y cuántas columnas tiene el grupo. */
  lane: number;
  laneCount: number;
}

/**
 * Ubica las citas con hora en la línea de tiempo. Las que se cruzan van lado a
 * lado, como en Teams o Google Calendar: cada grupo de citas encadenadas se
 * reparte en columnas, y cada cita toma la primera columna libre.
 */
export function buildTimelineBlocks(
  appointments: Appointment[],
  fallbackDuration: (appointment: Appointment) => number,
): TimelineBlock[] {
  const placed = appointments
    .map((appointment) => {
      const startMinute = resolveStartMinute(appointment);
      if (startMinute === null) return null;
      const savedEnd = toMinuteOfDay(appointment.schedule.endTime);
      const endMinute =
        savedEnd > startMinute ? savedEnd : startMinute + fallbackDuration(appointment);
      return { appointment, startMinute, endMinute: Math.min(endMinute, TIMELINE_END_MINUTE) };
    })
    .filter((block): block is Omit<TimelineBlock, 'lane' | 'laneCount'> => block !== null)
    .sort(
      (first, second) =>
        first.startMinute - second.startMinute || second.endMinute - first.endMinute,
    );

  const blocks: TimelineBlock[] = [];
  let group: TimelineBlock[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;

  const closeGroup = () => {
    group.forEach((block) => (block.laneCount = laneEnds.length));
    blocks.push(...group);
    group = [];
    laneEnds = [];
  };

  placed.forEach((item) => {
    if (item.startMinute >= groupEnd) closeGroup();
    const freeLane = laneEnds.findIndex((laneEnd) => laneEnd <= item.startMinute);
    const lane = freeLane === -1 ? laneEnds.length : freeLane;
    laneEnds[lane] = item.endMinute;
    group.push({ ...item, lane, laneCount: 1 });
    groupEnd = Math.max(groupEnd, item.endMinute);
  });
  closeGroup();

  return blocks;
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
