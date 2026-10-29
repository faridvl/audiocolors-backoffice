import React from 'react';
import { Form, Formik } from 'formik';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplateEditor } from './clinical-template-editor';
import { ClinicalTemplateFormValues } from './clinical-template-form';
import { useClinicalHistoryTemplate } from './use-clinical-history-template';

interface ClinicalHistoryTemplateContainerProps {
  onDirtyChange: (isDirty: boolean) => void;
}

export const ClinicalHistoryTemplateContainer: React.FC<ClinicalHistoryTemplateContainerProps> = ({
  onDirtyChange,
}) => {
  const { t } = useTranslation();
  const { initialValues, validationSchema, isLoading, isError, refetch, isPending, handleSubmit } =
    useClinicalHistoryTemplate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>
          {t(TEXT.CLINICAL_TEMPLATE.LOADING)}
        </Typography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.ACCENT}>
          {t(TEXT.CLINICAL_TEMPLATE.LOAD_ERROR)}
        </Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
          {t(TEXT.GENERAL.BUTTONS.RETRY)}
        </Button>
      </div>
    );
  }

  return (
    <Formik<ClinicalTemplateFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ errors, dirty }) => (
        <Form className="flex w-full flex-col gap-4">
          <FormDirtyReporter onDirtyChange={onDirtyChange} />
          {/* Con el dedo no se arrastra: la indicación solo desde `sm`. */}
          <Typography variant={TypographyVariant.HELPER} className="hidden sm:block">
            {t(TEXT.CLINICAL_TEMPLATE.DRAG_HINT)}
          </Typography>

          <ClinicalTemplateEditor
            error={typeof errors.questions === 'string' ? errors.questions : undefined}
          />

          {/* Fija abajo: con muchas preguntas, guardar no obliga a bajar hasta el final. */}
          <div className="sticky bottom-0 z-10 flex justify-end border-t border-ink-100 bg-white py-3">
            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              isLoading={isPending}
              disabled={!dirty}
            >
              {t(TEXT.GENERAL.BUTTONS.SAVE)}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
