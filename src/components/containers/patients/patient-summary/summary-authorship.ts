import type { TFunction } from 'i18next';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';

/** "Autor, fecha" de un registro; sin autor conocido, solo la fecha. */
export function buildAuthorship(t: TFunction, authorName: string | null, isoDate: string): string {
  const date = formatDate(isoDate);
  const author = authorName?.trim();
  if (!author) return date;
  return t(TEXT.PATIENTS.CLINICAL_SUMMARY.DOCUMENT.AUTHORSHIP, { author, date });
}
