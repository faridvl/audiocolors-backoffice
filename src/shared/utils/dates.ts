/**
 * Fechas "de calendario" de la clínica. Un día se maneja como "YYYY-MM-DD" y
 * un mes como "YYYY-MM", siempre en hora local (el día de la clínica, no el
 * UTC). Sirve a cualquier pantalla que navegue por días o meses.
 */

/** Locale de todo texto de fecha y hora que ve la clínica. */
export const CLINIC_LOCALE = 'es-CR';

export const DAYS_IN_WEEK = 7;
const MINUTE_IN_MS = 60_000;

/** Largo de "YYYY-MM" y "YYYY", para recortar un día a su mes o su año. */
enum KeyLength {
  YEAR = 4,
  MONTH = 7,
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Fecha local -> "YYYY-MM-DD". */
export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> fecha local a medianoche. */
export function fromDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "YYYY-MM-DD" -> "YYYY-MM". */
export function toMonthKey(dayKey: string): string {
  return dayKey.slice(0, KeyLength.MONTH);
}

/** "YYYY-MM" -> su primer día, "YYYY-MM-01". */
export function firstDayOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
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

export function isSameYear(dayKey: string, otherDayKey: string): boolean {
  return dayKey.slice(0, KeyLength.YEAR) === otherDayKey.slice(0, KeyLength.YEAR);
}

/** Número del día del mes de un "YYYY-MM-DD" (1-31). */
export function dayOfMonth(dayKey: string): number {
  return fromDayKey(dayKey).getDate();
}

/** Columna del día en una semana de lunes a domingo: lunes 0, domingo 6. */
export function weekdayIndex(dayKey: string): number {
  return (fromDayKey(dayKey).getDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK;
}

/** Lunes de la semana de una fecha. */
export function startOfWeek(date: Date): Date {
  const mondayOffset = weekdayIndex(toDayKey(date));
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MINUTE_IN_MS);
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
  const leadingBlanks = (firstDay.getDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK;

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
  return toMonthKey(toDayKey(new Date(year, month - 1 + offset, 1)));
}

/** Fecha local de un día a una hora exacta (minutos en cero). */
export function atHour(dayKey: string, hour: number): Date {
  const date = fromDayKey(dayKey);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/** "8:00 a. m.": una hora del día en el formato de la clínica. */
export function formatHour(hour: number): string {
  return atHour(toDayKey(new Date()), hour).toLocaleTimeString(CLINIC_LOCALE, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function capitalize(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

/** "Jue" + "12": un día en una franja semanal. */
export function formatWeekDay(dayKey: string): { weekday: string; day: string } {
  const date = fromDayKey(dayKey);
  const weekday = date.toLocaleDateString(CLINIC_LOCALE, { weekday: 'short' }).replace('.', '');
  return { weekday: capitalize(weekday), day: String(date.getDate()) };
}

/** "jueves 12 de marzo", con el año solo si no es el de referencia. */
export function formatLongDay(dayKey: string, referenceDayKey: string): string {
  return fromDayKey(dayKey).toLocaleDateString(CLINIC_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(!isSameYear(dayKey, referenceDayKey) && { year: 'numeric' }),
  });
}

/** "mié 30 sept": un día en poco espacio. */
export function formatCompactDay(dayKey: string): string {
  return fromDayKey(dayKey)
    .toLocaleDateString(CLINIC_LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .replace(',', '');
}
