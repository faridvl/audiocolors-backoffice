import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import { BackgroundCondition, PatientBackground } from '@/types/patients/patient-background';
import { PATIENT_NOTE_TEXT_MAX_LENGTH } from '@/types/patients/patient-note';
import type { PatientBackgroundFormValues } from './use-patient-background-form';

/** Largo máximo de un texto citado en la nota, para que varios cambios entren en una sola. */
const QUOTED_TEXT_MAX_LENGTH = 100;
const ELLIPSIS = '…';

function quote(t: TFunction, value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return t(TEXT.GENERAL.NOT_REGISTERED);
  return text.length > QUOTED_TEXT_MAX_LENGTH
    ? `${text.slice(0, QUOTED_TEXT_MAX_LENGTH)}${ELLIPSIS}`
    : text;
}

const yesNo = (t: TFunction, value: boolean) => t(value ? TEXT.GENERAL.YES : TEXT.GENERAL.NO);

/**
 * Nota de Control de evolución con lo que cambió respecto de la historia
 * original, que no se modifica. Null si no cambió nada.
 */
export function buildBackgroundChangeNote(
  t: TFunction,
  original: PatientBackground,
  values: PatientBackgroundFormValues,
): string | null {
  const line = (label: string, before: string, after: string) =>
    t(TEXT.PATIENTS.BACKGROUND.UPDATE.CHANGE_LINE, { label, before, after });

  const changes = Object.values(BackgroundCondition)
    .filter((condition) => original[condition] !== values[condition])
    .map((condition) =>
      line(
        t(`${TEXT.PATIENTS.BACKGROUND.CONDITION_PREFIX}.${condition}`),
        yesNo(t, original[condition]),
        yesNo(t, values[condition]),
      ),
    );

  const texts: { label: string; before: string | null; after: string }[] = [
    {
      label: t(TEXT.PATIENTS.BACKGROUND.UPDATE.TONE_LABEL),
      before: original.tinnitusTone,
      after: values.tinnitus ? values.tinnitusTone : '',
    },
    {
      label: t(TEXT.PATIENTS.BACKGROUND.RIGHT_EAR),
      before: original.otoscopyRight,
      after: values.otoscopyRight,
    },
    {
      label: t(TEXT.PATIENTS.BACKGROUND.LEFT_EAR),
      before: original.otoscopyLeft,
      after: values.otoscopyLeft,
    },
  ];
  texts
    .filter(({ before, after }) => (before?.trim() ?? '') !== after.trim())
    .forEach(({ label, before, after }) =>
      changes.push(line(label, quote(t, before), quote(t, after))),
    );

  if (changes.length === 0) return null;

  const note = [t(TEXT.PATIENTS.BACKGROUND.UPDATE.NOTE_TITLE), ...changes].join('\n');
  return note.length > PATIENT_NOTE_TEXT_MAX_LENGTH
    ? `${note.slice(0, PATIENT_NOTE_TEXT_MAX_LENGTH - ELLIPSIS.length)}${ELLIPSIS}`
    : note;
}
