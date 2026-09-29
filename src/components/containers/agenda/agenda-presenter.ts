import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';

/** Días que muestra la franja de la semana: de lunes a domingo. */
const DAYS_IN_WEEK = 7;

/**
 * Grupos del día. Hoy y los días pasados se leen como una fila de llegada
 * (por llegar → en sala → atendidas); un día futuro solo tiene agendadas.
 * No se agrupa por hora porque el API todavía no guarda la hora real.
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

/** Fecha local -> "YYYY-MM-DD" (el día de la clínica, no el UTC). */
export function toDayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> fecha local a medianoche. */
export function fromDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "YYYY-MM-DD" -> "YYYY-MM", el mes del filtro de próxima cita. */
export function toMonthKey(dayKey: string): string {
  return dayKey.slice(0, 7);
}

/** Lunes de la semana de una fecha. */
export function startOfWeek(date: Date): Date {
  const mondayOffset = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function buildWeekDayKeys(weekStart: Date): string[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => toDayKey(addDays(weekStart, offset)));
}

/**
 * Celdas del calendario de un mes ("YYYY-MM"), de lunes a domingo. Los huecos
 * antes del día 1 y después del último son null.
 */
export function buildMonthGrid(monthKey: string): (string | null)[] {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toDayKey(new Date(year, month - 1, day)));
  }
  while (cells.length % DAYS_IN_WEEK !== 0) cells.push(null);

  return cells;
}

/** Mes siguiente (o anterior, con -1) de un "YYYY-MM". */
export function shiftMonth(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  return toDayKey(new Date(year, month - 1 + offset, 1)).slice(0, 7);
}

export function getDayTiming(dayKey: string, todayKey: string): DayTiming {
  if (dayKey === todayKey) return DayTiming.TODAY;
  return dayKey < todayKey ? DayTiming.PAST : DayTiming.FUTURE;
}

/** "Jue" + "12": lo que muestra cada botón de la franja semanal. */
export function formatWeekDay(dayKey: string): { weekday: string; day: string } {
  const date = fromDayKey(dayKey);
  const weekday = date.toLocaleDateString('es-CR', { weekday: 'short' }).replace('.', '');
  return {
    weekday: `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`,
    day: String(date.getDate()),
  };
}

/** "jueves 12 de marzo", con el año solo si no es el actual. */
export function formatLongDay(dayKey: string, todayKey: string): string {
  const date = fromDayKey(dayKey);
  const isOtherYear = dayKey.slice(0, 4) !== todayKey.slice(0, 4);
  return date.toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(isOtherYear && { year: 'numeric' }),
  });
}

/** "mié 30 sept": el día elegido en el botón del calendario. */
export function formatCompactDay(dayKey: string): string {
  return fromDayKey(dayKey)
    .toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .replace(',', '');
}

export function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
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
  RESCHEDULE = 'RESCHEDULE',
  WHATSAPP = 'WHATSAPP',
  CALENDAR = 'CALENDAR',
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
  const contactActions = [
    AppointmentAction.RESCHEDULE,
    AppointmentAction.WHATSAPP,
    AppointmentAction.CALENDAR,
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
