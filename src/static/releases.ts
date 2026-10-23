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
 * y `yarn release:check` la exige antes de un PR a main (RULES.md §10).
 */
export const RELEASES: Release[] = [
  // release:next — `yarn release:bump` agrega la versión nueva acá arriba.
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
