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
