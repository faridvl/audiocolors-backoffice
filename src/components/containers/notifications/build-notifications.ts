export enum NotificationKind {
  RELEASE = 'RELEASE',
  STALE_PATIENT = 'STALE_PATIENT',
}

export interface ReleaseSource {
  version: string;
  publishedAt: string;
}

export interface StalePatientSource {
  uuid: string;
  fullName: string;
  lastMovementAt: string;
}

export interface ReleaseNotification<R extends ReleaseSource> {
  id: string;
  kind: NotificationKind.RELEASE;
  publishedAt: string;
  release: R;
}

export interface StalePatientNotification {
  id: string;
  kind: NotificationKind.STALE_PATIENT;
  publishedAt: string;
  patient: StalePatientSource;
}

export type AppNotificationOf<R extends ReleaseSource> =
  ReleaseNotification<R> | StalePatientNotification;

export const releaseNotificationId = (version: string) => `release-${version}`;

/** Lleva la fecha del último movimiento: si el paciente vuelve a quedar inactivo, es un aviso nuevo. */
export const stalePatientNotificationId = (uuid: string, lastMovementAt: string) =>
  `stale-${uuid}-${lastMovementAt}`;

/**
 * Versiones primero (son pocas y recientes) y después los pacientes sin movimiento,
 * en el orden en que llegan del API (del más antiguo al más reciente). Los limpiados no salen.
 */
export function buildNotifications<R extends ReleaseSource>(
  releases: readonly R[],
  stalePatients: readonly StalePatientSource[],
  clearedIds: readonly string[],
): AppNotificationOf<R>[] {
  const releaseNotifications: AppNotificationOf<R>[] = releases.map((release) => ({
    id: releaseNotificationId(release.version),
    kind: NotificationKind.RELEASE,
    publishedAt: release.publishedAt,
    release,
  }));
  const staleNotifications: AppNotificationOf<R>[] = stalePatients.map((patient) => ({
    id: stalePatientNotificationId(patient.uuid, patient.lastMovementAt),
    kind: NotificationKind.STALE_PATIENT,
    publishedAt: patient.lastMovementAt,
    patient,
  }));

  return [...releaseNotifications, ...staleNotifications].filter(
    ({ id }) => !clearedIds.includes(id),
  );
}
