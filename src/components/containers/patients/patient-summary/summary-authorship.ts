import type { TFunction } from 'i18next';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';

/** Nombre de quien hizo el registro si se conoce; vacío si no (nunca un texto genérico). */
export function resolveKnownAuthor(
  currentUser: { uuid?: string; fullName?: string } | null | undefined,
  authorUuid: string,
  authorName?: string | null,
): string {
  if (authorName) return authorName;
  if (currentUser?.uuid && authorUuid === currentUser.uuid) return currentUser.fullName ?? '';
  return '';
}

/** "Autor, fecha" de un registro; sin autor conocido, solo la fecha. */
export function buildAuthorship(t: TFunction, authorName: string | null, isoDate: string): string {
  const date = formatDate(isoDate);
  const author = authorName?.trim();
  if (!author) return date;
  return t(TEXT.PATIENTS.CLINICAL_SUMMARY.DOCUMENT.AUTHORSHIP, { author, date });
}
