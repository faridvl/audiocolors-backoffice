import { env } from '@/shared/api/config';

/** `webcal://` le dice al teléfono "esto es un calendario, suscríbete" en vez de descargarlo. */
const WEBCAL_PROTOCOL = 'webcal:';
const HTTP_PROTOCOL = /^https?:/;
const FEED_PATH = '/calendar-feed';
const FEED_EXTENSION = '.ics';
const KEY_SEPARATOR = ':';

interface CalendarFeedUrlOptions {
  branchUuid: string;
  /** Además, solo las citas de este tipo. */
  typeUuid?: string;
  /** Color con que el iPhone pinta ese calendario (`#rrggbb`). */
  color?: string;
}

/** Misma clave que usa el API: "sede" o "sede:tipo". */
export function buildCalendarKey(branchUuid: string, typeUuid?: string): string {
  return typeUuid ? `${branchUuid}${KEY_SEPARATOR}${typeUuid}` : branchUuid;
}

/** Enlace de suscripción de un calendario: una sede, o una sede y un tipo. */
export function buildCalendarFeedUrl(token: string, options: CalendarFeedUrlOptions): string {
  const url = new URL(`${env.API.MEDICAL_RECORDS_URL}${FEED_PATH}/${token}${FEED_EXTENSION}`);
  url.searchParams.set('branch', options.branchUuid);
  if (options.typeUuid) url.searchParams.set('type', options.typeUuid);
  if (options.color) url.searchParams.set('color', options.color);
  // `url.protocol = 'webcal:'` no sirve: el estándar de URL ignora pasar de
  // https (esquema especial) a uno que no lo es.
  return url.toString().replace(HTTP_PROTOCOL, WEBCAL_PROTOCOL);
}
