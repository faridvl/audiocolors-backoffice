/**
 * Archivo `.ics` de un solo evento, para el botón "Agregar a mi calendario".
 * El iPhone lo abre con Calendario y ofrece agregarlo; Google y Outlook lo
 * importan igual.
 *
 * El evento es de día completo a propósito: el API todavía no guarda la hora
 * real de la cita (la fija a las 08:00 UTC), y poner esa hora en el
 * calendario del doctor sería inventarla.
 *
 * Es una copia: si la cita se mueve en la app, el evento del calendario no
 * se entera.
 */

interface CalendarEventInput {
  uid: string;
  /** Día de la cita, "YYYY-MM-DD". */
  dayKey: string;
  title: string;
  description?: string;
}

/** "2026-03-12" -> "20260312". */
function toIcsDate(dayKey: string): string {
  return dayKey.replace(/-/g, '');
}

/** Día siguiente a "YYYY-MM-DD", también como "YYYYMMDD" (DTEND es exclusivo). */
function nextIcsDate(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10).replace(/-/g, '');
}

/** Comas, punto y coma y saltos de línea se escapan según RFC 5545. */
function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildIcs(event: CalendarEventInput): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AudioColors//Gestion Clinica//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}@audiocolors`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(event.dayKey)}`,
    `DTEND;VALUE=DATE:${nextIcsDate(event.dayKey)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    ...(event.description ? [`DESCRIPTION:${escapeIcsText(event.description)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadCalendarEvent(event: CalendarEventInput, fileName: string): void {
  const blob = new Blob([buildIcs(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
