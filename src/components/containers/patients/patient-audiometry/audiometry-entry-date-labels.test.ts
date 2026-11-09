import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildEntryDateLabels } from './audiometry-entry-date-labels';

const formatDate = (isoDate: string): string => isoDate.slice(0, 16);
const labelWithPta = (date: string, right: number | null, left: number | null): string =>
  `${date} · PTA OD ${right ?? '-'} / OI ${left ?? '-'}`;

describe('buildEntryDateLabels', () => {
  it('deja solo la fecha cuando ninguna se repite', () => {
    const labels = buildEntryDateLabels(
      [
        { uuid: 'a', createdAt: '2026-11-08T14:44:00Z', ptaRight: 55, ptaLeft: 60 },
        { uuid: 'b', createdAt: '2026-11-08T15:10:00Z', ptaRight: 40, ptaLeft: 45 },
      ],
      formatDate,
      labelWithPta,
    );
    assert.equal(labels.get('a'), '2026-11-08T14:44');
    assert.equal(labels.get('b'), '2026-11-08T15:10');
  });

  it('agrega el PTA a las que comparten fecha y hora', () => {
    const labels = buildEntryDateLabels(
      [
        { uuid: 'a', createdAt: '2026-11-08T17:58:10Z', ptaRight: 55, ptaLeft: 60 },
        { uuid: 'b', createdAt: '2026-11-08T17:58:40Z', ptaRight: 30, ptaLeft: null },
        { uuid: 'c', createdAt: '2026-11-08T18:20:00Z', ptaRight: 20, ptaLeft: 20 },
      ],
      formatDate,
      labelWithPta,
    );
    assert.equal(labels.get('a'), '2026-11-08T17:58 · PTA OD 55 / OI 60');
    assert.equal(labels.get('b'), '2026-11-08T17:58 · PTA OD 30 / OI -');
    assert.equal(labels.get('c'), '2026-11-08T18:20');
  });

  it('deja solo la fecha si la repetida no trae PTA', () => {
    const labels = buildEntryDateLabels(
      [
        { uuid: 'a', createdAt: '2026-11-08T17:58:10Z', ptaRight: null, ptaLeft: null },
        { uuid: 'b', createdAt: '2026-11-08T17:58:40Z', ptaRight: 30, ptaLeft: 35 },
      ],
      formatDate,
      labelWithPta,
    );
    assert.equal(labels.get('a'), '2026-11-08T17:58');
    assert.equal(labels.get('b'), '2026-11-08T17:58 · PTA OD 30 / OI 35');
  });
});
