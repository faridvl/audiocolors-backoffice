import type { TFunction } from 'i18next';
import * as Yup from 'yup';
import { findUnknownVariables } from '@/shared/utils/document-template-text';
import { TEXT } from '@/static/texts/i18n';
import {
  DOCUMENT_TEMPLATE_CONTENT_MAX_LENGTH,
  DOCUMENT_TEMPLATE_NAME_MAX_LENGTH,
  DocumentTemplate,
  SaveDocumentTemplatePayload,
} from '@/types/document-templates/document-template';

export interface DocumentTemplateFormValues {
  name: string;
  content: string;
}

export const EMPTY_DOCUMENT_TEMPLATE_VALUES: DocumentTemplateFormValues = {
  name: '',
  content: '',
};

export function toFormValues(template: DocumentTemplate | null): DocumentTemplateFormValues {
  if (!template) return EMPTY_DOCUMENT_TEMPLATE_VALUES;
  return {
    name: template.name,
    content: template.content,
  };
}

export function toPayload(values: DocumentTemplateFormValues): SaveDocumentTemplatePayload {
  return {
    name: values.name.trim(),
    content: values.content,
  };
}

export function buildDocumentTemplateSchema(t: TFunction) {
  return Yup.object({
    name: Yup.string()
      .trim()
      .required(t(TEXT.DOCUMENT_TEMPLATES.ERRORS.NAME_REQUIRED))
      .max(
        DOCUMENT_TEMPLATE_NAME_MAX_LENGTH,
        t(TEXT.DOCUMENT_TEMPLATES.ERRORS.NAME_MAX, { max: DOCUMENT_TEMPLATE_NAME_MAX_LENGTH }),
      ),
    content: Yup.string()
      .required(t(TEXT.DOCUMENT_TEMPLATES.ERRORS.CONTENT_REQUIRED))
      .max(
        DOCUMENT_TEMPLATE_CONTENT_MAX_LENGTH,
        t(TEXT.DOCUMENT_TEMPLATES.ERRORS.CONTENT_MAX, {
          max: DOCUMENT_TEMPLATE_CONTENT_MAX_LENGTH,
        }),
      )
      .test('known-variables', (value, context) => {
        const unknown = findUnknownVariables(value ?? '');
        if (unknown.length === 0) return true;
        return context.createError({
          message: t(TEXT.DOCUMENT_TEMPLATES.ERRORS.UNKNOWN_VARIABLE, {
            count: unknown.length,
            names: unknown.map((name) => `{{${name}}}`).join(', '),
          }),
        });
      }),
  });
}
