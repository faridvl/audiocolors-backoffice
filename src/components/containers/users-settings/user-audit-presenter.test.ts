import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TFunction } from 'i18next';
import { UserAuditEntry, UserAuditField } from '../../../types/users/user';
import { buildAuditItems, formatAuditValue } from './user-audit-presenter';

const messages = JSON.parse(
  readFileSync(join(process.cwd(), 'src/static/texts/es.json'), 'utf-8'),
) as Record<string, unknown>;

/** `t` de pruebas: resuelve la clave en es.json e interpola `{{name}}`. */
const t = ((key: string, params?: Record<string, string>) => {
  const text = key.split('.').reduce<unknown>((node, part) => {
    if (typeof node !== 'object' || node === null) return undefined;
    return (node as Record<string, unknown>)[part];
  }, messages);
  assert.equal(typeof text, 'string', `falta la clave ${key}`);
  return (text as string).replace(/\{\{(\w+)\}\}/g, (_, name: string) => params?.[name] ?? '');
}) as unknown as TFunction;

const MOMENT = '2026-05-01T10:00:00.000Z';
const LATER = '2026-05-02T10:00:00.000Z';

const buildEntry = (overrides: Partial<UserAuditEntry>): UserAuditEntry => ({
  actorName: 'Ana Pérez',
  targetName: 'Luis Mora',
  field: UserAuditField.ROLE,
  before: null,
  after: 'RECEPTION',
  createdAt: MOMENT,
  ...overrides,
});

describe('formatAuditValue', () => {
  it('un nivel anterior vacío se lee "Sin nivel"', () => {
    assert.equal(formatAuditValue(UserAuditField.ROLE, null, t), 'Sin nivel');
    assert.equal(formatAuditValue(UserAuditField.ROLE, '', t), 'Sin nivel');
  });

  it('unas especialidades vacías se leen "Sin especialidades"', () => {
    assert.equal(formatAuditValue(UserAuditField.SPECIALTIES, null, t), 'Sin especialidades');
    assert.equal(formatAuditValue(UserAuditField.SPECIALTIES, '', t), 'Sin especialidades');
  });

  it('traduce el nivel, el sí o no y la lista de especialidades', () => {
    assert.equal(formatAuditValue(UserAuditField.ROLE, 'ADMIN', t), 'Administración');
    assert.equal(formatAuditValue(UserAuditField.ATTENDS_PATIENTS, 'true', t), 'Sí');
    assert.equal(formatAuditValue(UserAuditField.ATTENDS_PATIENTS, 'false', t), 'No');
    assert.equal(
      formatAuditValue(UserAuditField.SPECIALTIES, 'AUDIOLOGY,GENERAL_MEDICINE', t),
      'Audiología, Medicina general',
    );
  });
});

describe('buildAuditItems', () => {
  it('resume una creación en una sola línea', () => {
    const items = buildAuditItems(
      [
        buildEntry({ field: UserAuditField.SPECIALTIES, after: null }),
        buildEntry({ field: UserAuditField.ATTENDS_PATIENTS, after: 'false' }),
        buildEntry({ field: UserAuditField.ROLE, after: 'RECEPTION' }),
      ],
      t,
    );
    assert.equal(items.length, 1);
    assert.equal(items[0].text, 'Usuario creado con nivel Recepción.');
    assert.equal(items[0].actorName, 'Ana Pérez');
  });

  it('la creación de quien atiende pacientes dice sus especialidades', () => {
    const items = buildAuditItems(
      [
        buildEntry({ field: UserAuditField.ROLE, after: 'ADMIN' }),
        buildEntry({ field: UserAuditField.ATTENDS_PATIENTS, after: 'true' }),
        buildEntry({ field: UserAuditField.SPECIALTIES, after: 'AUDIOLOGY' }),
      ],
      t,
    );
    assert.deepEqual(
      items.map(({ text }) => text),
      ['Usuario creado con nivel Administración, atiende pacientes: Audiología.'],
    );
  });

  it('un cambio con valor anterior no se toma por creación y sale en orden', () => {
    const items = buildAuditItems(
      [
        buildEntry({ field: UserAuditField.SPECIALTIES, before: 'AUDIOLOGY', after: null }),
        buildEntry({ field: UserAuditField.ATTENDS_PATIENTS, before: 'true', after: 'false' }),
        buildEntry({ field: UserAuditField.ROLE, before: 'RECEPTION', after: 'ADMIN' }),
      ],
      t,
    );
    assert.deepEqual(
      items.map(({ text }) => text),
      [
        'Nivel de acceso: Recepción → Administración',
        'Atiende pacientes: Sí → No',
        'Especialidades: Audiología → Sin especialidades',
      ],
    );
  });

  it('la creación como la registra el API (atiende anterior en false) sale en una línea', () => {
    const items = buildAuditItems(
      [
        buildEntry({ field: UserAuditField.ROLE, before: null, after: 'RECEPTION' }),
        buildEntry({ field: UserAuditField.ATTENDS_PATIENTS, before: 'false', after: 'true' }),
        buildEntry({ field: UserAuditField.SPECIALTIES, before: null, after: 'AUDIOLOGY,SPEECH_THERAPY' }),
      ],
      t,
    );
    assert.equal(items.length, 1);
    assert.match(items[0].text, /^Usuario creado con nivel Recepción, atiende pacientes: /);
  });

  it('un cambio sin nivel anterior, en un instante sin creación completa, muestra "Sin nivel"', () => {
    const items = buildAuditItems(
      [
        buildEntry({ field: UserAuditField.ROLE, before: null, after: 'ADMIN' }),
        buildEntry({ field: UserAuditField.ATTENDS_PATIENTS, before: 'true', after: 'false' }),
      ],
      t,
    );
    assert.equal(items[0].text, 'Nivel de acceso: Sin nivel → Administración');
  });

  it('conserva el orden de los instantes y no mezcla los de otro momento', () => {
    const items = buildAuditItems(
      [
        buildEntry({ createdAt: LATER, before: 'RECEPTION', after: 'ADMIN' }),
        buildEntry({ createdAt: MOMENT, field: UserAuditField.ROLE, after: 'RECEPTION' }),
      ],
      t,
    );
    assert.deepEqual(
      items.map(({ createdAt }) => createdAt),
      [LATER, MOMENT],
    );
    assert.equal(new Set(items.map(({ key }) => key)).size, 2);
  });
});
