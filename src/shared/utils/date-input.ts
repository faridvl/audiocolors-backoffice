import { CLINIC_LOCALE, DAYS_IN_WEEK, fromDayKey, toDayKey } from '@/shared/utils/dates';

// El texto de un campo de fecha es "dd/mm/aaaa"; el valor que sale del campo sigue siendo "YYYY-MM-DD".
const DAY_DIGITS = 2;
const MONTH_DIGITS = 2;
const YEAR_DIGITS = 4;
export const DATE_INPUT_MAX_DIGITS = DAY_DIGITS + MONTH_DIGITS + YEAR_DIGITS;
export const DATE_INPUT_MAX_LENGTH = DATE_INPUT_MAX_DIGITS + 2;
/** Años anteriores no son fechas de un expediente: "0001" se tomaría como 1901. */
export const DATE_INPUT_MIN_YEAR = 1900;

const onlyDigits = (text: string) => text.replace(/\D/g, '');

/** Pone las barras mientras se escribe: "15032026" -> "15/03/2026". */
export function maskDateInput(text: string): string {
  const digits = onlyDigits(text).slice(0, DATE_INPUT_MAX_DIGITS);
  const day = digits.slice(0, DAY_DIGITS);
  const month = digits.slice(DAY_DIGITS, DAY_DIGITS + MONTH_DIGITS);
  const year = digits.slice(DAY_DIGITS + MONTH_DIGITS);
  return [day, month, year].filter(Boolean).join('/');
}

/**
 * Texto tras un cambio del usuario. Borrar solo una barra no cambia los dígitos y la máscara la
 * pondría de vuelta: en ese caso se borra el dígito anterior.
 */
export function applyDateInputChange(previousText: string, rawText: string): string {
  const isDeletion = rawText.length < previousText.length;
  const sameDigits = onlyDigits(rawText) === onlyDigits(previousText);
  if (isDeletion && sameDigits) {
    return maskDateInput(onlyDigits(previousText).slice(0, -1));
  }
  return maskDateInput(rawText);
}

/** "YYYY-MM-DD" -> "dd/mm/aaaa" (vacío si no es un día válido). */
export function dayKeyToInputText(dayKey: string): string {
  if (!isValidDayKey(dayKey)) return '';
  const [year, month, day] = dayKey.split('-');
  return `${day}/${month}/${year}`;
}

/** "dd/mm/aaaa" completo y real -> "YYYY-MM-DD"; si falta algo o no existe (31/02), null. */
export function inputTextToDayKey(text: string): string | null {
  const digits = onlyDigits(text);
  if (digits.length !== DATE_INPUT_MAX_DIGITS) return null;
  const day = digits.slice(0, DAY_DIGITS);
  const month = digits.slice(DAY_DIGITS, DAY_DIGITS + MONTH_DIGITS);
  const year = digits.slice(DAY_DIGITS + MONTH_DIGITS);
  const dayKey = `${year}-${month}-${day}`;
  return isValidDayKey(dayKey) ? dayKey : null;
}

/** Día real del calendario en formato "YYYY-MM-DD" (hora local, nunca UTC). */
export function isValidDayKey(dayKey: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return false;
  const year = Number(dayKey.slice(0, 4));
  return year >= DATE_INPUT_MIN_YEAR && toDayKey(fromDayKey(dayKey)) === dayKey;
}

/** "domingo, 15 de marzo de 2026": lo que lee un lector de pantalla en cada día del calendario. */
export function formatDayForScreenReader(dayKey: string): string {
  return fromDayKey(dayKey).toLocaleDateString(CLINIC_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Iniciales de los días de la semana, de lunes a domingo ("L", "M", "M", "J", "V", "S", "D"). */
export function buildWeekdayInitials(): string[] {
  const knownMonday = new Date(2024, 0, 1);
  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) =>
    new Date(
      knownMonday.getFullYear(),
      knownMonday.getMonth(),
      knownMonday.getDate() + offset,
    ).toLocaleDateString(CLINIC_LOCALE, { weekday: 'narrow' }),
  );
}
