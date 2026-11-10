import { TEXT } from '@/static/texts/i18n';

/** Grupos de una versión, en el orden en que se muestran. */
export enum ReleaseChangeKind {
  NEW = 'NEW',
  IMPROVED = 'IMPROVED',
  FIXED = 'FIXED',
}

export interface ReleaseChange {
  kind: ReleaseChangeKind;
  /** Claves de `TEXT`: el texto vive en es.json, como el resto. */
  titleKey: string;
  descriptionKey: string;
}

export interface Release {
  version: string;
  /** Mediodía UTC: así el día no cambia al mostrarlo en Costa Rica. */
  publishedAt: string;
  changes: ReleaseChange[];
}

const change =
  (kind: ReleaseChangeKind) =>
  (key: string): ReleaseChange => ({
    kind,
    titleKey: `${TEXT.NOTIFICATIONS.RELEASES_PREFIX}.${key}.title`,
    descriptionKey: `${TEXT.NOTIFICATIONS.RELEASES_PREFIX}.${key}.description`,
  });

const feature = change(ReleaseChangeKind.NEW);
const improvement = change(ReleaseChangeKind.IMPROVED);
const fix = change(ReleaseChangeKind.FIXED);

/**
 * Versiones publicadas, de la más nueva a la más antigua. Cada una llega a la
 * clínica como una notificación. Una nueva se crea con `yarn release:bump X.Y.Z`
 * y `yarn release:check` la exige antes de un PR a main (RULES.md §8).
 */
export const RELEASES: Release[] = [
  // release:next — `yarn release:bump` agrega la versión nueva acá arriba.
  {
    version: '2.1.0',
    publishedAt: '2026-11-10T12:00:00Z',
    changes: [
      feature('v2_1_0.users'),
      feature('v2_1_0.profile'),
      feature('v2_1_0.branches'),
      feature('v2_1_0.equipment'),
      improvement('v2_1_0.permissions'),
      improvement('v2_1_0.priority'),
      improvement('v2_1_0.weber'),
      improvement('v2_1_0.audiometryReport'),
      improvement('v2_1_0.settings'),
      improvement('v2_1_0.clinicalRecord'),
      improvement('v2_1_0.session'),
    ],
  },
  {
    version: '2.0.0',
    publishedAt: '2026-11-08T12:00:00Z',
    changes: [
      feature('v2_0_0.audiometry'),
      feature('v2_0_0.patientSummary'),
      feature('v2_0_0.documentTemplates'),
      feature('v2_0_0.clinic'),
      feature('v2_0_0.questions'),
      feature('v2_0_0.maintenance'),
      feature('v2_0_0.laboratory'),
      feature('v2_0_0.otoscopy'),
      feature('v2_0_0.contactAttempts'),
      feature('v2_0_0.priority'),
      feature('v2_0_0.stalePatients'),
      improvement('v2_0_0.patients'),
      improvement('v2_0_0.agenda'),
      improvement('v2_0_0.files'),
      improvement('v2_0_0.settings'),
      improvement('v2_0_0.mobile'),
      fix('v2_0_0.agendaHours'),
      fix('v2_0_0.maintenanceMonth'),
      fix('v2_0_0.clinicalHistory'),
      fix('v2_0_0.security'),
    ],
  },
  {
    version: '1.0.0',
    publishedAt: '2026-10-23T12:00:00Z',
    changes: [
      feature('v1_0_0.clinicalHistory'),
      feature('v1_0_0.settings'),
      feature('v1_0_0.notifications'),
      improvement('v1_0_0.roles'),
      improvement('v1_0_0.warranty'),
      improvement('v1_0_0.files'),
      improvement('v1_0_0.patients'),
      improvement('v1_0_0.agenda'),
      fix('v1_0_0.agendaDrag'),
    ],
  },
];
