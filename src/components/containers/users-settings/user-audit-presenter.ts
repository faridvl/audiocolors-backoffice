import type { TFunction } from 'i18next';
import { TEXT } from '../../../static/texts/i18n';
import { UserAuditEntry, UserAuditField } from '../../../types/users/user';
import { isKnownRole } from './users-logic';

const TEXTS = TEXT.SETTINGS.USERS;
const SPECIALTIES_SEPARATOR = ',';
const ATTENDS_TRUE = 'true';
const ATTENDS_FALSE = 'false';

/** Orden de las entradas que ocurren en el mismo instante. */
const FIELD_ORDER: UserAuditField[] = [
  UserAuditField.ROLE,
  UserAuditField.ATTENDS_PATIENTS,
  UserAuditField.SPECIALTIES,
  UserAuditField.PASSWORD,
];

export interface UserAuditItem {
  key: string;
  text: string;
  actorName: string;
  createdAt: string;
}

const isSpecialtyCode = (code: string): code is keyof typeof TEXTS.SPECIALTIES =>
  code in TEXTS.SPECIALTIES;

const isEmpty = (value: string | null): boolean => value === null || value === '';

function formatSpecialties(value: string, t: TFunction): string {
  return value
    .split(SPECIALTIES_SEPARATOR)
    .map((code) => (isSpecialtyCode(code) ? t(TEXTS.SPECIALTIES[code]) : code))
    .join(', ');
}

/** Convierte el valor crudo de la bitácora (códigos del API) en texto para la persona. */
export function formatAuditValue(
  field: UserAuditField,
  value: string | null,
  t: TFunction,
): string {
  if (field === UserAuditField.ROLE) {
    if (value === null || value === '') return t(TEXTS.AUDIT.NO_ROLE);
    return isKnownRole(value) ? t(TEXTS.ROLES[value]) : value;
  }
  if (field === UserAuditField.ATTENDS_PATIENTS) {
    return t(value === ATTENDS_TRUE ? TEXT.GENERAL.YES : TEXT.GENERAL.NO);
  }
  if (value === null || value === '') return t(TEXTS.AUDIT.NO_SPECIALTIES);
  return formatSpecialties(value, t);
}

export function formatAuditChange(entry: UserAuditEntry, t: TFunction): string {
  // Nunca se muestran valores de una contraseña, ni siquiera los que llegaran del API.
  if (entry.field === UserAuditField.PASSWORD) return t(TEXTS.AUDIT.PASSWORD_CHANGED);
  return t(TEXTS.AUDIT.CHANGE, {
    field: t(TEXTS.AUDIT.FIELDS[entry.field]),
    before: formatAuditValue(entry.field, entry.before, t),
    after: formatAuditValue(entry.field, entry.after, t),
  });
}

const fieldRank = (field: UserAuditField): number => FIELD_ORDER.indexOf(field);

/** El API registra la creación con "atiende" anterior en false, no vacío. */
const isCreationBefore = ({ field, before }: UserAuditEntry): boolean =>
  isEmpty(before) || (field === UserAuditField.ATTENDS_PATIENTS && before === ATTENDS_FALSE);

/** Una creación deja el nivel y todo lo demás sin valor anterior, en el mismo instante. */
function describeCreation(group: UserAuditEntry[], t: TFunction): string | null {
  const roleEntry = group.find(({ field }) => field === UserAuditField.ROLE);
  if (!roleEntry || !group.every(isCreationBefore)) return null;

  const role = formatAuditValue(UserAuditField.ROLE, roleEntry.after, t);
  const attends = group.find(({ field }) => field === UserAuditField.ATTENDS_PATIENTS);
  const specialties = group.find(({ field }) => field === UserAuditField.SPECIALTIES);
  if (attends?.after === ATTENDS_TRUE && specialties?.after) {
    return t(TEXTS.AUDIT.CREATED_ATTENDS, {
      role,
      specialties: formatSpecialties(specialties.after, t),
    });
  }
  return t(TEXTS.AUDIT.CREATED, { role });
}

/**
 * Filas de la bitácora: agrupa lo que pasó en el mismo instante (respetando el orden en que llega),
 * lo ordena por campo y resume la creación de un usuario en una sola línea.
 */
export function buildAuditItems(entries: UserAuditEntry[], t: TFunction): UserAuditItem[] {
  const groups = new Map<string, UserAuditEntry[]>();
  for (const entry of entries) {
    const group = groups.get(entry.createdAt);
    if (group) group.push(entry);
    else groups.set(entry.createdAt, [entry]);
  }

  const items: UserAuditItem[] = [];
  for (const [createdAt, group] of groups) {
    const sorted = [...group].sort((a, b) => fieldRank(a.field) - fieldRank(b.field));
    const creation = describeCreation(sorted, t);
    if (creation) {
      items.push({
        key: `${createdAt}-created`,
        text: creation,
        actorName: sorted[0].actorName,
        createdAt,
      });
      continue;
    }
    for (const entry of sorted) {
      items.push({
        key: `${createdAt}-${entry.field}`,
        text: formatAuditChange(entry, t),
        actorName: entry.actorName,
        createdAt,
      });
    }
  }
  return items;
}
