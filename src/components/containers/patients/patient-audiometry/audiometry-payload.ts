import {
  AudiometryPoint,
  AudiometryTool,
  Ear,
  GradingScale,
  HearingGrade,
  PtaType,
  ScreeningResult,
  WeberResult,
} from './audiometry-constants';
import { WordListType } from './speech-word-lists';

/** Las claves de los mapas son frecuencias (Hz) o intensidades (dB) como texto, igual que en el API. */
export type AudiometryToneMarksPayload = Record<
  AudiometryTool,
  Record<Ear, Partial<Record<string, AudiometryPoint>>>
>;

export interface AudiometryEarSummaryPayload {
  pta: number | null;
  grade: HearingGrade | null;
  speechThresholdDb: number | null;
  maxDiscriminationPercent: number | null;
  failedWords: number | null;
}

export interface AudiometryPayload {
  marks: AudiometryToneMarksPayload;
  weber: Partial<Record<string, WeberResult>>;
  speech: {
    marks: Record<Ear, Record<string, number>>;
    wordListType: WordListType | null;
    wordListId: string | null;
    presentedWords: number;
  };
  summary: {
    ptaType: PtaType;
    gradingScale: GradingScale;
    ears: Record<Ear, AudiometryEarSummaryPayload>;
  };
  notes: { diagnosis: string; observations: string };
}

/** Rastreo: solo vía aérea, sin enmascarar, con el resultado y las observaciones. */
export interface ScreeningPayload {
  marks: { [AudiometryTool.AIR]: Record<Ear, Partial<Record<string, AudiometryPoint>>> };
  result: ScreeningResult;
  notes: { observations: string };
}
