import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildEarSummary } from './audiometry-calculations';
import {
  AudiometryTool,
  DEFAULT_GRADING_SCALE,
  DEFAULT_PTA_TYPE,
  EARS,
  Ear,
  SpeechField,
  WeberResult,
  buildDefaultWeber,
  buildEmptyAudiometryNotes,
  buildEmptyFailedWordsValues,
  buildEmptyMarks,
  buildEmptySpeechFieldValues,
  buildEmptySpeechMarks,
  buildSampleMarks,
  buildSampleSpeechMarks,
} from './audiometry-constants';
import {
  AudiometryFormState,
  hasAudiometryData,
  payloadToState,
  stateToPayload,
} from './audiometry-payload-mapper';
import { WordListType } from './speech-word-lists';

const buildEmptyState = (): AudiometryFormState => ({
  marks: buildEmptyMarks(),
  weber: buildDefaultWeber(),
  speechMarks: buildEmptySpeechMarks(),
  speechFieldValues: buildEmptySpeechFieldValues(),
  failedWords: buildEmptyFailedWordsValues(),
  wordListType: null,
  wordListId: null,
  presentedWords: 25,
  ptaType: DEFAULT_PTA_TYPE,
  gradingScale: DEFAULT_GRADING_SCALE,
  notes: buildEmptyAudiometryNotes(),
});

const buildFullState = (): AudiometryFormState => {
  const state = buildEmptyState();
  state.marks = buildSampleMarks();
  state.speechMarks = buildSampleSpeechMarks();
  state.weber = { ...buildDefaultWeber(), 1000: WeberResult.LEFT };
  state.wordListType = WordListType.BISYLLABLE;
  state.wordListId = 'B2';
  state.presentedWords = 10;
  state.speechFieldValues[Ear.RIGHT][SpeechField.THRESHOLD] = '25';
  state.speechFieldValues[Ear.RIGHT][SpeechField.MAX_DISCRIMINATION] = '90';
  state.speechFieldValues[Ear.LEFT][SpeechField.THRESHOLD] = '-';
  state.failedWords[Ear.RIGHT] = '1';
  state.notes = { diagnosis: '  Hipoacusia leve  ', observations: 'Sin observaciones' };
  return state;
};

const summariesOf = (state: AudiometryFormState) =>
  Object.fromEntries(
    EARS.map((ear) => [ear, buildEarSummary(state.marks, ear, state.ptaType, state.gradingScale)]),
  ) as Record<Ear, ReturnType<typeof buildEarSummary>>;

describe('stateToPayload', () => {
  it('manda las cinco herramientas con los dos oídos y las claves como texto', () => {
    const state = buildEmptyState();
    state.marks[AudiometryTool.AIR][Ear.RIGHT][500] = {
      thresholdDb: 25,
      isMasked: true,
      hasNoResponse: false,
    };
    const payload = stateToPayload(state, summariesOf(state));

    assert.deepEqual(Object.keys(payload.marks).sort(), [
      'AIR',
      'BONE',
      'FREE_FIELD',
      'MCL',
      'UCL',
    ]);
    assert.deepEqual(payload.marks.AIR.RIGHT, {
      '500': { thresholdDb: 25, isMasked: true, hasNoResponse: false },
    });
    assert.deepEqual(payload.marks.AIR.LEFT, {});
    assert.deepEqual(payload.marks.BONE.RIGHT, {});
  });

  it('manda el resumen tal como se escribió y pasa a null lo vacío o parcial', () => {
    const state = buildFullState();
    const { ears } = stateToPayload(state, summariesOf(state)).summary;

    assert.equal(ears.RIGHT.speechThresholdDb, 25);
    assert.equal(ears.RIGHT.maxDiscriminationPercent, 90);
    assert.equal(ears.RIGHT.failedWords, 1);
    assert.equal(ears.LEFT.speechThresholdDb, null);
    assert.equal(ears.LEFT.maxDiscriminationPercent, null);
    assert.equal(ears.LEFT.failedWords, null);
  });

  it('descarta falladas que superan las palabras presentadas', () => {
    const state = buildFullState();
    state.failedWords[Ear.LEFT] = '20';
    const { ears } = stateToPayload(state, summariesOf(state)).summary;
    assert.equal(ears.LEFT.failedWords, null);
  });

  it('manda todas las frecuencias del Weber, las notas sin espacios y la lista solo si hay tipo', () => {
    const state = buildFullState();
    const payload = stateToPayload(state, summariesOf(state));
    assert.deepEqual(payload.weber, {
      '500': 'CENTER',
      '1000': 'LEFT',
      '2000': 'CENTER',
      '4000': 'CENTER',
    });
    assert.equal(payload.notes.diagnosis, 'Hipoacusia leve');
    assert.equal(payload.speech.wordListId, 'B2');

    state.wordListType = null;
    assert.equal(stateToPayload(state, summariesOf(state)).speech.wordListId, null);
  });
});

describe('stateToPayload con campos a medio escribir', () => {
  it('manda null en lugar de texto vacío o "-" y siempre presentedWords', () => {
    const state = buildEmptyState();
    state.speechFieldValues[Ear.RIGHT][SpeechField.THRESHOLD] = '-';
    state.speechFieldValues[Ear.RIGHT][SpeechField.MAX_DISCRIMINATION] = '';
    state.failedWords[Ear.RIGHT] = '-';
    const payload = stateToPayload(state, summariesOf(state));
    assert.deepEqual(payload.summary.ears.RIGHT, {
      pta: null,
      grade: null,
      speechThresholdDb: null,
      maxDiscriminationPercent: null,
      failedWords: null,
    });
    assert.equal(payload.speech.presentedWords, 25);
  });

  it('alinea presentedWords con el tipo de lista y no enmascara fuera de aérea y ósea', () => {
    const state = buildFullState();
    state.presentedWords = 25;
    state.marks[AudiometryTool.UCL][Ear.RIGHT][1000] = {
      thresholdDb: 80,
      isMasked: true,
      hasNoResponse: false,
    };
    const payload = stateToPayload(state, summariesOf(state));
    assert.equal(payload.speech.presentedWords, 10);
    assert.equal(payload.marks.UCL.RIGHT['1000']?.isMasked, false);
  });
});

describe('payloadToState', () => {
  it('devuelve el mismo estado que se guardó', () => {
    const state = buildFullState();
    state.speechFieldValues[Ear.LEFT][SpeechField.THRESHOLD] = '';
    state.notes.diagnosis = 'Hipoacusia leve';
    const payload = stateToPayload(state, summariesOf(state));
    const restored = payloadToState(JSON.parse(JSON.stringify(payload)));

    assert.deepEqual(restored, state);
  });

  it('rellena el Weber que falte con el valor por defecto', () => {
    const payload = stateToPayload(buildEmptyState(), summariesOf(buildEmptyState()));
    payload.weber = { '500': WeberResult.RIGHT };
    const restored = payloadToState(payload);
    assert.equal(restored.weber[500], WeberResult.RIGHT);
    assert.equal(restored.weber[4000], WeberResult.CENTER);
  });
});

describe('hasAudiometryData', () => {
  it('no hay datos en una audiometría nueva, con el Weber por defecto', () => {
    assert.equal(hasAudiometryData(buildEmptyState()), false);
  });

  it('hay datos con una marca, un valor del resumen o una nota', () => {
    assert.equal(hasAudiometryData(buildFullState()), true);

    const withSummary = buildEmptyState();
    withSummary.failedWords[Ear.RIGHT] = '2';
    assert.equal(hasAudiometryData(withSummary), true);

    const withNotes = buildEmptyState();
    withNotes.notes.observations = 'Control en 6 meses';
    assert.equal(hasAudiometryData(withNotes), true);
  });
});
