import { env } from '@/shared/api/config';

/** `webcal://` le dice al teléfono "esto es un calendario, suscríbete" en vez de descargarlo. */
const WEBCAL_PROTOCOL = 'webcal:';
const HTTP_PROTOCOL = /^https?:/;
const FEED_PATH = '/calendar-feed';
const FEED_EXTENSION = '.ics';

interface CalendarFeedUrlOptions {
  /** Solo las citas de esta sede. */
  branchUuid?: string;
  /** Color con que el iPhone pinta ese calendario (`#rrggbb`). */
  color?: string;
}

/** Enlace de suscripción del usuario: una sede (con su color) o todas. */
export function buildCalendarFeedUrl(token: string, options: CalendarFeedUrlOptions = {}): string {
  const url = new URL(`${env.API.MEDICAL_RECORDS_URL}${FEED_PATH}/${token}${FEED_EXTENSION}`);
  if (options.branchUuid) url.searchParams.set('branch', options.branchUuid);
  if (options.color) url.searchParams.set('color', options.color);
  // `url.protocol = 'webcal:'` no sirve: el estándar de URL ignora pasar de
  // https (esquema especial) a uno que no lo es.
  return url.toString().replace(HTTP_PROTOCOL, WEBCAL_PROTOCOL);
}
