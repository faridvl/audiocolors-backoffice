import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  filterValidAudiometries,
  resolveDefaultAudiometryUuids,
  resolveSelectedAudiometries,
} from './summary-audiometry-selection';

const entry = (uuid: string, createdAt: string, invalidatedAt: string | null = null) => ({
  uuid,
  createdAt,
  invalidatedAt,
});

const OLD = entry('old', '2026-01-10T10:00:00.000Z');
const MIDDLE_INVALID = entry('middle', '2026-03-10T10:00:00.000Z', '2026-03-11T10:00:00.000Z');
const NEWEST_INVALID = entry('newest', '2026-05-10T10:00:00.000Z', '2026-05-11T10:00:00.000Z');
const RECENT = entry('recent', '2026-04-10T10:00:00.000Z');

describe('filterValidAudiometries', () => {
  it('quita las marcadas como mal hechas', () => {
    const result = filterValidAudiometries([OLD, MIDDLE_INVALID, NEWEST_INVALID, RECENT]);
    assert.deepEqual(
      result.map((item) => item.uuid),
      ['old', 'recent'],
    );
  });

  it('trata un invalidatedAt ausente como valida (API que aun no manda el campo)', () => {
    const withoutField = { uuid: 'sin-campo', createdAt: '2026-02-10T10:00:00.000Z' };
    const result = filterValidAudiometries([withoutField, MIDDLE_INVALID]);
    assert.deepEqual(
      result.map((item) => item.uuid),
      ['sin-campo'],
    );
  });

  it('devuelve vacio si todas estan marcadas', () => {
    assert.deepEqual(filterValidAudiometries([MIDDLE_INVALID, NEWEST_INVALID]), []);
  });
});

describe('resolveDefaultAudiometryUuids', () => {
  it('elige la valida mas reciente aunque una marcada sea mas nueva', () => {
    assert.deepEqual(resolveDefaultAudiometryUuids([OLD, NEWEST_INVALID, RECENT, MIDDLE_INVALID]), [
      'recent',
    ]);
  });

  it('no elige nada si no hay validas', () => {
    assert.deepEqual(resolveDefaultAudiometryUuids([NEWEST_INVALID]), []);
    assert.deepEqual(resolveDefaultAudiometryUuids([]), []);
  });
});

describe('resolveSelectedAudiometries', () => {
  it('ordena por fecha ascendente sin importar el orden de seleccion', () => {
    const result = resolveSelectedAudiometries([OLD, RECENT], ['recent', 'old']);
    assert.deepEqual(
      result.map((item) => item.uuid),
      ['old', 'recent'],
    );
  });

  it('descarta marcadas y desconocidas aunque esten elegidas', () => {
    const result = resolveSelectedAudiometries(
      [OLD, MIDDLE_INVALID, RECENT],
      ['middle', 'old', 'missing'],
    );
    assert.deepEqual(
      result.map((item) => item.uuid),
      ['old'],
    );
  });

  it('no muta la lista original', () => {
    const source = [RECENT, OLD];
    resolveSelectedAudiometries(source, ['old', 'recent']);
    assert.deepEqual(
      source.map((item) => item.uuid),
      ['recent', 'old'],
    );
  });
});
