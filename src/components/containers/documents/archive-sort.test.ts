import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterValidAudiometries } from '../patients/patient-summary/summary-audiometry-selection';
import { sortArchiveItems } from './archive-sort';

const audiometry = (uuid: string, createdAt: string, invalidatedAt: string | null = null) => ({
  uuid,
  createdAt,
  invalidatedAt,
  sortTime: Date.parse(createdAt),
});

describe('lista de Archivos', () => {
  const entries = [
    audiometry('vieja', '2026-01-10T10:00:00.000Z'),
    audiometry('mal-hecha', '2026-05-10T10:00:00.000Z', '2026-05-11T10:00:00.000Z'),
    audiometry('reciente', '2026-04-10T10:00:00.000Z'),
    audiometry('media', '2026-03-10T10:00:00.000Z'),
  ];

  it('no incluye las audiometrías mal hechas aunque sean las más nuevas', () => {
    const uuids = sortArchiveItems(filterValidAudiometries(entries)).map((item) => item.uuid);
    assert.equal(uuids.includes('mal-hecha'), false);
  });

  it('conserva el orden de la más reciente a la más antigua', () => {
    const uuids = sortArchiveItems(filterValidAudiometries(entries)).map((item) => item.uuid);
    assert.deepEqual(uuids, ['reciente', 'media', 'vieja']);
  });

  it('deja al final la que tiene una fecha ilegible', () => {
    const broken = { uuid: 'rota', sortTime: Number.NaN };
    const uuids = sortArchiveItems([broken, ...entries]).map((item) => item.uuid);
    assert.equal(uuids[uuids.length - 1], 'rota');
  });
});
