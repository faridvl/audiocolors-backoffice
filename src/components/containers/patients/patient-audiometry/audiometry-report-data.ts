import { EarSummary, buildEarSummary } from './audiometry-calculations';
import {
  AudiogramMarks,
  DEFAULT_PRESENTED_WORDS_TYPE,
  EARS,
  Ear,
  GradingScale,
  PRESENTED_WORDS_BY_LIST_TYPE,
  PtaType,
} from './audiometry-constants';
import {
  AudiometryFormState,
  resolveListTypeFromPresentedWords,
} from './audiometry-payload-mapper';
import { WordListType } from './speech-word-lists';

/** Datos del informe que se calculan a partir de lo guardado, no se almacenan. */
export interface AudiometryReportData {
  summaries: Record<Ear, EarSummary>;
  presentedWords: number;
}

export function buildEarSummaries(
  marks: AudiogramMarks,
  ptaType: PtaType,
  gradingScale: GradingScale,
): Record<Ear, EarSummary> {
  return Object.fromEntries(
    EARS.map((ear) => [ear, buildEarSummary(marks, ear, ptaType, gradingScale)]),
  ) as Record<Ear, EarSummary>;
}

/** Palabras presentadas por oído para un tipo de lista; sin tipo, las de la lista por defecto. */
export function presentedWordsOf(listType: WordListType | null): number {
  return PRESENTED_WORDS_BY_LIST_TYPE[listType ?? DEFAULT_PRESENTED_WORDS_TYPE];
}

export function buildAudiometryReportData(state: AudiometryFormState): AudiometryReportData {
  return {
    summaries: buildEarSummaries(state.marks, state.ptaType, state.gradingScale),
    presentedWords: presentedWordsOf(
      resolveListTypeFromPresentedWords(state.wordListType, state.presentedWords),
    ),
  };
}
