import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildEarSummary } from './audiometry-calculations';
import {
  AudiometryTool,
  DEFAULT_GRADING_SCALE,
  DEFAULT_PTA_TYPE,
  EARS,
  Ear,
  ScreeningResult,
  SpeechField,
  WeberResult,
  buildEmptyWeber,
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
  ScreeningFormState,
  payloadToState,
  screeningPayloadToState,
  screeningStateToPayload,
  stateToPayload,
} from './audiometry-payload-mapper';
import { WordListType } from './speech-word-lists';

const buildEmptyState = (): AudiometryFormState => ({
  marks: buildEmptyMarks(),
  weber: buildEmptyWeber(),
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
  state.weber = { ...buildEmptyWeber(), 1000: WeberResult.LEFT };
  state.wordListType = WordListType.BISYLLABLE;
  state.wordListId = 'B2';
  state.presentedWords = 10;
  state.speechFieldValues[Ear.RIGHT][SpeechField.THRESHOLD] = '25';
  state.speechFieldValues[Ear.RIGHT][SpeechField.MAX_DISCRIMINATION] = '90';
  state.speechFieldValues[Ear.LEFT][SpeechField.THRESHOLD] = '-';
  state.failedWords[Ear.RIGHT] = '1';
  state.notes = {
    diagnosis: '  Hipoacusia leve  ',
    observations: 'Sin observaciones',
  };
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

  it('manda solo el Weber elegido, las notas sin espacios y la lista solo si hay tipo', () => {
    const state = buildFullState();
    const payload = stateToPayload(state, summariesOf(state));
    assert.deepEqual(payload.weber, { '1000': 'LEFT' });
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

  it('manda y restaura "sin respuesta" del Weber', () => {
    const state = buildFullState();
    state.weber = { ...state.weber, 2000: WeberResult.NO_RESPONSE };
    const payload = stateToPayload(state, summariesOf(state));
    assert.equal(payload.weber['2000'], 'NO_RESPONSE');
    assert.equal(
      payloadToState(JSON.parse(JSON.stringify(payload))).weber[2000],
      WeberResult.NO_RESPONSE,
    );
  });

  it('deja sin resultado el Weber que falte', () => {
    const payload = stateToPayload(buildEmptyState(), summariesOf(buildEmptyState()));
    payload.weber = { '500': WeberResult.RIGHT };
    const restored = payloadToState(payload);
    assert.equal(restored.weber[500], WeberResult.RIGHT);
    assert.equal(restored.weber[4000], undefined);
  });
});

describe('hasAudiometryData', () => {
  it('no hay datos en una audiometría nueva, con el Weber vacío', () => {
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

const buildScreeningState = (): ScreeningFormState => {
  const marks = buildEmptyMarks();
  marks[AudiometryTool.AIR][Ear.RIGHT][1000] = {
    thresholdDb: 20,
    isMasked: true,
    hasNoResponse: false,
  };
  marks[AudiometryTool.AIR][Ear.RIGHT][3000] = {
    thresholdDb: 25,
    isMasked: false,
    hasNoResponse: false,
  };
  marks[AudiometryTool.AIR][Ear.LEFT][500] = {
    thresholdDb: 120,
    isMasked: false,
    hasNoResponse: true,
  };
  // Una marca ajena a rastreo no debe viajar.
  marks[AudiometryTool.BONE][Ear.LEFT][500] = {
    thresholdDb: 30,
    isMasked: false,
    hasNoResponse: false,
  };
  return {
    marks,
    result: ScreeningResult.REFER,
    notes: { diagnosis: '', observations: '  Control en un mes  ' },
  };
};

describe('screeningStateToPayload', () => {
  it('manda solo vía aérea sin enmascarar, el resultado y solo observaciones', () => {
    const payload = screeningStateToPayload(buildScreeningState());

    assert.ok(payload);
    assert.deepEqual(Object.keys(payload.marks), ['AIR']);
    assert.deepEqual(payload.marks.AIR.RIGHT, {
      '1000': { thresholdDb: 20, isMasked: false, hasNoResponse: false },
      '3000': { thresholdDb: 25, isMasked: false, hasNoResponse: false },
    });
    assert.deepEqual(payload.marks.AIR.LEFT, {
      '500': { thresholdDb: 120, isMasked: false, hasNoResponse: true },
    });
    assert.equal(payload.result, 'REFER');
    assert.deepEqual(payload.notes, { observations: 'Control en un mes' });
  });

  it('no arma el cuerpo si falta el resultado', () => {
    const state = buildScreeningState();
    state.result = null;
    assert.equal(screeningStateToPayload(state), null);
  });
});

describe('screeningPayloadToState', () => {
  it('devuelve las marcas aéreas, el resultado y las observaciones guardadas', () => {
    const payload = screeningStateToPayload(buildScreeningState());
    assert.ok(payload);
    const restored = screeningPayloadToState(JSON.parse(JSON.stringify(payload)));

    assert.equal(restored.result, ScreeningResult.REFER);
    assert.deepEqual(restored.notes, {
      diagnosis: '',
      observations: 'Control en un mes',
    });
    assert.equal(restored.marks[AudiometryTool.AIR][Ear.RIGHT][3000]?.thresholdDb, 25);
    assert.equal(restored.marks[AudiometryTool.AIR][Ear.LEFT][500]?.hasNoResponse, true);
    assert.deepEqual(restored.marks[AudiometryTool.BONE][Ear.LEFT], {});
  });
});
