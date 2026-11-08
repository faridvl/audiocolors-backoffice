import React from 'react';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { DocumentTemplateEditorFields } from './document-template-editor-fields';
import { useDocumentTemplateEditor } from './use-document-template-editor';

interface DocumentTemplateEditorProps {
  /** `null` al crear una plantilla nueva. */
  templateUuid: string | null;
  onBack: () => void;
}

export const DocumentTemplateEditor: React.FC<DocumentTemplateEditorProps> = ({
  templateUuid,
  onBack,
}) => {
  const { t } = useTranslation();
  const {
    isLoading,
    isError,
    refetch,
    initialValues,
    validationSchema,
    isSaving,
    isNew,
    handleSubmit,
  } = useDocumentTemplateEditor(templateUuid, onBack);

  const backButton = (
    <Button
      variant={ButtonVariant.GHOST}
      onClick={onBack}
      icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
    >
      {t(TEXT.DOCUMENT_TEMPLATES.BACK)}
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-start gap-4">
        {backButton}
        <div className="flex w-full items-center justify-center gap-2 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.DOCUMENT_TEMPLATES.LOADING)}
          </Typography>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-start gap-4">
        {backButton}
        <div className="flex w-full flex-col items-center gap-2 py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {t(TEXT.DOCUMENT_TEMPLATES.ERRORS.LOAD_TEMPLATE)}
          </Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      <Form className="flex w-full flex-col gap-4" noValidate>
        <div className="flex flex-wrap items-center gap-2">
          {backButton}
          <Typography variant={TypographyVariant.ACCENT}>
            {t(isNew ? TEXT.DOCUMENT_TEMPLATES.NEW_TITLE : TEXT.DOCUMENT_TEMPLATES.EDIT_TITLE)}
          </Typography>
        </div>
        <DocumentTemplateEditorFields isSaving={isSaving} onCancel={onBack} />
      </Form>
    </Formik>
  );
};
