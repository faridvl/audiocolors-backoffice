import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { useSaveDocumentTemplateMutation } from '@/shared/api/mutations/document-templates/save-document-template-mutation';
import {
  FETCH_DOCUMENT_TEMPLATE_KEY,
  FETCH_DOCUMENT_TEMPLATES_KEY,
  useDocumentTemplateQuery,
} from '@/shared/api/querys/document-templates-query';
import { TEXT } from '@/static/texts/i18n';
import {
  buildDocumentTemplateSchema,
  DocumentTemplateFormValues,
  toFormValues,
  toPayload,
} from './document-template-form';

export function useDocumentTemplateEditor(templateUuid: string | null, onBack: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: template, isLoading, isError, refetch } = useDocumentTemplateQuery(templateUuid);
  const { executeSaveDocumentTemplate, isPending: isSaving } = useSaveDocumentTemplateMutation();

  const initialValues = useMemo(() => toFormValues(template ?? null), [template]);
  const validationSchema = useMemo(() => buildDocumentTemplateSchema(t), [t]);

  const handleSubmit = (
    values: DocumentTemplateFormValues,
    helpers: FormikHelpers<DocumentTemplateFormValues>,
  ) => {
    executeSaveDocumentTemplate(
      { templateUuid, template: toPayload(values) },
      {
        onSuccess: () => {
          toast.success(t(TEXT.DOCUMENT_TEMPLATES.SAVED));
          void queryClient.invalidateQueries({ queryKey: [FETCH_DOCUMENT_TEMPLATES_KEY] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_DOCUMENT_TEMPLATE_KEY] });
          onBack();
        },
        onError: (error: Error) => {
          // Un nombre repetido se corrige en su campo; lo demás sale como aviso.
          if (error instanceof ApiError && error.status === HttpStatus.CONFLICT) {
            helpers.setFieldError('name', t(TEXT.DOCUMENT_TEMPLATES.ERRORS.DUPLICATE_NAME));
            helpers.setSubmitting(false);
            return;
          }
          toast.error(error.message);
        },
      },
    );
  };

  return {
    isLoading: templateUuid !== null && isLoading,
    isError,
    refetch,
    initialValues,
    validationSchema,
    isSaving,
    isNew: templateUuid === null,
    handleSubmit,
  };
}
