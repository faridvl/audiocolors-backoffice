import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import { UserAuditEntry, UserAuditField } from '@/types/users/user';
import { isKnownRole } from './users-logic';

const TEXTS = TEXT.SETTINGS.USERS;
const SPECIALTIES_SEPARATOR = ',';
const ATTENDS_TRUE = 'true';

const isSpecialtyCode = (code: string): code is keyof typeof TEXTS.SPECIALTIES =>
  code in TEXTS.SPECIALTIES;

/** Convierte el valor crudo de la bitácora (códigos del API) en texto para la persona. */
export function formatAuditValue(
  field: UserAuditField,
  value: string | null,
  t: TFunction,
): string {
  if (value === null || value === '') return t(TEXTS.AUDIT.NONE);

  if (field === UserAuditField.ROLE) {
    return isKnownRole(value) ? t(TEXTS.ROLES[value]) : value;
  }
  if (field === UserAuditField.ATTENDS_PATIENTS) {
    return t(value === ATTENDS_TRUE ? TEXT.GENERAL.YES : TEXT.GENERAL.NO);
  }
  return value
    .split(SPECIALTIES_SEPARATOR)
    .map((code) => (isSpecialtyCode(code) ? t(TEXTS.SPECIALTIES[code]) : code))
    .join(', ');
}

export function formatAuditChange(entry: UserAuditEntry, t: TFunction): string {
  return t(TEXTS.AUDIT.CHANGE, {
    field: t(TEXTS.AUDIT.FIELDS[entry.field]),
    before: formatAuditValue(entry.field, entry.before, t),
    after: formatAuditValue(entry.field, entry.after, t),
  });
}
