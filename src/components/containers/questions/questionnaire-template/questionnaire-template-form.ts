import type { TFunction } from 'i18next';
import * as Yup from 'yup';
import {
  buildClinicalTemplateSchema,
  buildEmptyQuestion,
  ClinicalTemplateFormValues,
  toFormValues,
} from '@/components/containers/clinical-history-template/clinical-template-form';
import { TEXT } from '@/static/texts/i18n';
import {
  ClinicalTemplate,
  QUESTIONNAIRE_NAME_MAX_LENGTH,
} from '@/types/clinical-templates/clinical-template';

/** Las preguntas de la sección más su nombre, que la clínica puede cambiar. */
export interface QuestionnaireTemplateFormValues extends ClinicalTemplateFormValues {
  name: string;
}

export function buildQuestionnaireFormValues(
  template: ClinicalTemplate | null,
  draftName: string,
): QuestionnaireTemplateFormValues {
  if (!template) return { name: draftName, questions: [buildEmptyQuestion('')] };
  return { name: template.name, ...toFormValues(template.fields) };
}

export function buildQuestionnaireSchema(t: TFunction) {
  return buildClinicalTemplateSchema(t).shape({
    name: Yup.string()
      .trim()
      .required(t(TEXT.QUESTIONS.SECTION_NAME_REQUIRED))
      .max(QUESTIONNAIRE_NAME_MAX_LENGTH),
  });
}
