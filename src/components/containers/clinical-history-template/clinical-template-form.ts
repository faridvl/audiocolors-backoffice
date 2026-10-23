import type { TFunction } from 'i18next';
import * as Yup from 'yup';
import { TEXT } from '@/static/texts/i18n';
import {
  CLINICAL_FIELD_LABEL_MAX_LENGTH,
  CLINICAL_SECTION_MAX_LENGTH,
  ClinicalField,
  ClinicalFieldType,
} from '@/types/clinical-templates/clinical-template';

/** Cómo se responde una pregunta, en palabras del administrador. */
export enum ClinicalQuestionKind {
  YES_NO = 'YES_NO',
  YES_NO_DETAIL = 'YES_NO_DETAIL',
  TEXT = 'TEXT',
}

export interface ClinicalQuestionFormValues {
  /** Se conserva al editar: las respuestas ya guardadas se leen por este id. */
  id: string;
  label: string;
  section: string;
  kind: ClinicalQuestionKind;
  detailLabel: string;
}

export interface ClinicalTemplateFormValues {
  questions: ClinicalQuestionFormValues[];
}

function kindOf(field: ClinicalField): ClinicalQuestionKind {
  if (field.fieldType !== ClinicalFieldType.BOOLEAN) return ClinicalQuestionKind.TEXT;
  return field.detailLabel ? ClinicalQuestionKind.YES_NO_DETAIL : ClinicalQuestionKind.YES_NO;
}

export function toFormValues(fields: ClinicalField[]): ClinicalTemplateFormValues {
  return {
    questions: fields.map((field) => ({
      id: field.id,
      label: field.label,
      section: field.section ?? '',
      kind: kindOf(field),
      detailLabel: field.detailLabel ?? '',
    })),
  };
}

export function toTemplateFields(values: ClinicalTemplateFormValues): ClinicalField[] {
  return values.questions.map((question, index) => {
    const section = question.section.trim();
    const detailLabel = question.detailLabel.trim();
    return {
      id: question.id,
      label: question.label.trim(),
      fieldType:
        question.kind === ClinicalQuestionKind.TEXT
          ? ClinicalFieldType.TEXTAREA
          : ClinicalFieldType.BOOLEAN,
      required: false,
      order: index,
      ...(section ? { section } : {}),
      ...(question.kind === ClinicalQuestionKind.YES_NO_DETAIL ? { detailLabel } : {}),
    };
  });
}

export interface ClinicalQuestionGroup {
  /** Id de su primera pregunta: no cambia mientras se escribe el nombre de la sección. */
  key: string;
  /** Vacía: las preguntas sueltas, sin título. */
  section: string;
  /** Posiciones en la lista de preguntas del formulario. */
  indexes: number[];
}

const sameSection = (first: string, second: string) => first.trim() === second.trim();

/** Agrupa por sección en el orden en que aparece cada una, como en la hoja. */
export function groupQuestionsBySection(
  questions: ClinicalQuestionFormValues[],
): ClinicalQuestionGroup[] {
  const groups: ClinicalQuestionGroup[] = [];
  questions.forEach((question, index) => {
    const group = groups.find((candidate) => sameSection(candidate.section, question.section));
    if (group) group.indexes.push(index);
    else groups.push({ key: question.id, section: question.section, indexes: [index] });
  });
  return groups;
}

/**
 * Mueve una pregunta delante de otra (y pasa a su sección) o, sin `beforeIndex`,
 * al final de `section`.
 */
export function moveQuestion(
  questions: ClinicalQuestionFormValues[],
  fromIndex: number,
  section: string,
  beforeIndex: number | null,
): ClinicalQuestionFormValues[] {
  const moved = { ...questions[fromIndex], section };
  const rest = questions.filter((_, index) => index !== fromIndex);

  let insertAt: number;
  if (beforeIndex !== null) {
    insertAt = beforeIndex > fromIndex ? beforeIndex - 1 : beforeIndex;
  } else {
    const lastInSection = rest.reduce(
      (last, question, index) => (sameSection(question.section, section) ? index : last),
      -1,
    );
    insertAt = lastInSection === -1 ? rest.length : lastInSection + 1;
  }

  rest.splice(insertAt, 0, moved);
  return rest;
}

/** Cambia el nombre de una sección en todas sus preguntas. */
export function renameSection(
  questions: ClinicalQuestionFormValues[],
  indexes: number[],
  name: string,
): ClinicalQuestionFormValues[] {
  return questions.map((question, index) =>
    indexes.includes(index) ? { ...question, section: name } : question,
  );
}

export function buildEmptyQuestion(section: string): ClinicalQuestionFormValues {
  return {
    id: crypto.randomUUID(),
    label: '',
    section,
    kind: ClinicalQuestionKind.YES_NO,
    detailLabel: '',
  };
}

export function buildClinicalTemplateSchema(t: TFunction) {
  return Yup.object({
    questions: Yup.array()
      .of(
        Yup.object({
          label: Yup.string()
            .trim()
            .required(t(TEXT.CLINICAL_TEMPLATE.VALIDATION.LABEL_REQUIRED))
            .max(CLINICAL_FIELD_LABEL_MAX_LENGTH),
          section: Yup.string().trim().max(CLINICAL_SECTION_MAX_LENGTH),
          detailLabel: Yup.string()
            .trim()
            .max(CLINICAL_FIELD_LABEL_MAX_LENGTH)
            .when('kind', {
              is: ClinicalQuestionKind.YES_NO_DETAIL,
              then: (schema) =>
                schema.required(t(TEXT.CLINICAL_TEMPLATE.VALIDATION.DETAIL_REQUIRED)),
            }),
        }),
      )
      .min(1, t(TEXT.CLINICAL_TEMPLATE.VALIDATION.AT_LEAST_ONE)),
  });
}
