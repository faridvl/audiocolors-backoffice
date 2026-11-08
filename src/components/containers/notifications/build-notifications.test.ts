import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildNotifications, NotificationKind } from './build-notifications';

const RELEASES = [
  { version: '1.1.0', publishedAt: '2026-11-01' },
  { version: '1.0.0', publishedAt: '2026-10-23' },
];
const STALE = [
  { uuid: 'p-1', fullName: 'Ana Mora', lastMovementAt: '2026-04-01T15:00:00.000Z' },
  { uuid: 'p-2', fullName: 'Luis Rojas', lastMovementAt: '2026-05-02T15:00:00.000Z' },
];

describe('buildNotifications', () => {
  it('arma los ids de versiones y pacientes', () => {
    const ids = buildNotifications(RELEASES, STALE, []).map(({ id }) => id);
    assert.deepEqual(ids, [
      'release-1.1.0',
      'release-1.0.0',
      'stale-p-1-2026-04-01T15:00:00.000Z',
      'stale-p-2-2026-05-02T15:00:00.000Z',
    ]);
  });

  it('pone las versiones arriba y respeta el orden del API en los pacientes', () => {
    const kinds = buildNotifications(RELEASES, STALE, []).map(({ kind }) => kind);
    assert.deepEqual(kinds, [
      NotificationKind.RELEASE,
      NotificationKind.RELEASE,
      NotificationKind.STALE_PATIENT,
      NotificationKind.STALE_PATIENT,
    ]);
  });

  it('sin pacientes (consulta fallida o vacía) deja solo las versiones', () => {
    assert.equal(buildNotifications(RELEASES, [], []).length, 2);
  });

  it('no muestra las limpiadas', () => {
    const cleared = ['release-1.0.0', 'stale-p-1-2026-04-01T15:00:00.000Z'];
    const ids = buildNotifications(RELEASES, STALE, cleared).map(({ id }) => id);
    assert.deepEqual(ids, ['release-1.1.0', 'stale-p-2-2026-05-02T15:00:00.000Z']);
  });

  it('un movimiento nuevo cambia el id y el aviso reaparece aunque el anterior se limpiara', () => {
    const cleared = ['stale-p-1-2026-04-01T15:00:00.000Z'];
    const later = [{ ...STALE[0], lastMovementAt: '2026-06-10T15:00:00.000Z' }];
    const ids = buildNotifications([], later, cleared).map(({ id }) => id);
    assert.deepEqual(ids, ['stale-p-1-2026-06-10T15:00:00.000Z']);
  });
});
