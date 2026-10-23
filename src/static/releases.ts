import { TEXT } from '@/static/texts/i18n';

export interface ReleaseItem {
  /** Emoji del cambio: le da vida a la nota sin ser texto (el texto sale de es.json). */
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

export interface Release {
  version: string;
  /** Mediodía UTC: así el día no cambia al mostrarlo en Costa Rica. */
  publishedAt: string;
  items: ReleaseItem[];
}

const item = (icon: string, key: string): ReleaseItem => ({
  icon,
  titleKey: `${TEXT.NOTIFICATIONS.RELEASES_PREFIX}.${key}.title`,
  descriptionKey: `${TEXT.NOTIFICATIONS.RELEASES_PREFIX}.${key}.description`,
});

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
    items: [
      item('📋', 'v1_0_0.clinicalHistory'),
      item('⚙️', 'v1_0_0.settings'),
      item('🔐', 'v1_0_0.roles'),
      item('🛡️', 'v1_0_0.warranty'),
      item('📁', 'v1_0_0.files'),
      item('👥', 'v1_0_0.patients'),
      item('📅', 'v1_0_0.agenda'),
    ],
  },
];
