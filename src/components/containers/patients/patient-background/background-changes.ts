import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  ClinicalAnswer,
  ClinicalField,
  ClinicalFieldType,
} from '@/types/clinical-templates/clinical-template';
import {
  ClinicalHistoryFormValues,
  detailOf,
  textOf,
  yesNoLabel,
  yesNoOf,
} from './clinical-history';

export interface BackgroundChange {
  label: string;
  before: string;
  after: string;
}

/** Lo que cambió respecto de la historia original, que no se modifica. Vacío si nada. */
export function buildBackgroundChanges(
  t: TFunction,
  fields: ClinicalField[],
  original: Record<string, ClinicalAnswer>,
  values: ClinicalHistoryFormValues,
): BackgroundChange[] {
  const empty = t(TEXT.GENERAL.NOT_REGISTERED);
  const changes: BackgroundChange[] = [];

  fields.forEach(({ id, label, fieldType, detailLabel }) => {
    if (fieldType !== ClinicalFieldType.BOOLEAN) {
      const before = textOf(original[id]);
      const after = values.texts[id]?.trim() ?? '';
      if (before !== after) changes.push({ label, before: before || empty, after: after || empty });
      return;
    }

    const previousAnswer = yesNoOf(original[id]);
    const currentAnswer = values.checks[id] ?? null;
    const wasYes = previousAnswer === true;
    const isNowYes = currentAnswer === true;
    if (previousAnswer !== currentAnswer) {
      changes.push({
        label,
        before: yesNoLabel(t, previousAnswer),
        after: yesNoLabel(t, currentAnswer),
      });
    }

    if (detailLabel) {
      const before = wasYes ? detailOf(original[id]) : '';
      const after = isNowYes ? (values.details[id]?.trim() ?? '') : '';
      if (before !== after) {
        changes.push({
          label: detailLabel,
          before: before || empty,
          after: after || empty,
        });
      }
    }
  });

  return changes;
}
