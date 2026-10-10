/** `GET/POST /calendar-feed`: el enlace del usuario y el estado de cada calendario. */
export interface CalendarFeedStatus {
  /** Token del enlace, o null si todavía no se creó. */
  token: string | null;
  /** Calendarios quitados ("sede" o "sede:tipo"): el API los publica vacíos. */
  removedCalendarKeys: string[];
  /** Última vez (ISO) que el teléfono pidió cada calendario. */
  fetchedCalendars: Record<string, string>;
}

/** Cómo se reparten las citas en el teléfono. */
export enum CalendarGrouping {
  BRANCH = 'branch',
  BRANCH_AND_TYPE = 'branch-and-type',
}

/** Qué ofrece cada calendario según lo que el API sabe de él. */
export enum CalendarState {
  /** Nunca se agregó (o se borró del teléfono hace días). */
  NOT_ADDED = 'not-added',
  /** El teléfono lo está leyendo. */
  ON_PHONE = 'on-phone',
  /** Se quitó desde la app: sigue en el teléfono, pero vacío. */
  REMOVED = 'removed',
}
