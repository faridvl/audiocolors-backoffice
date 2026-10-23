import { TEXT } from '@/static/texts/i18n';

export interface ReleaseItem {
  /** Claves de `TEXT`: el texto vive en es.json, como el resto. */
  titleKey: string;
  descriptionKey: string;
}

export interface Release {
  version: string;
  /** Mediodía UTC: así el día no cambia al mostrarlo en Costa Rica. */
  publishedAt: string;
  items: ReleaseItem[];
}

const item = (key: string): ReleaseItem => ({
  titleKey: `${TEXT.RELEASE_NOTES.RELEASES_PREFIX}.${key}.title`,
  descriptionKey: `${TEXT.RELEASE_NOTES.RELEASES_PREFIX}.${key}.description`,
});

/**
 * Novedades que ve la clínica, de la más nueva a la más antigua. Una versión
 * nueva se agrega arriba al salir a producción (ver `docs/novedades/HISTORIAL.md`).
 */
export const RELEASES: Release[] = [
  {
    version: '1.0.0',
    publishedAt: '2026-10-23T12:00:00Z',
    items: [
      item('v1_0_0.clinicalHistory'),
      item('v1_0_0.settings'),
      item('v1_0_0.roles'),
      item('v1_0_0.warranty'),
      item('v1_0_0.files'),
      item('v1_0_0.patients'),
      item('v1_0_0.agenda'),
    ],
  },
];

export const LATEST_RELEASE = RELEASES[0];
