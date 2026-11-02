import React, { useCallback } from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { ClinicalTemplateEditor } from '@/components/containers/clinical-history-template/clinical-template-editor';
import { TEXT } from '@/static/texts/i18n';
import {
  ClinicalTemplate,
  QUESTIONNAIRE_NAME_MAX_LENGTH,
} from '@/types/clinical-templates/clinical-template';
import { QuestionnaireTemplateFormValues } from './questionnaire-template-form';
import { useQuestionnaireTemplate } from './use-questionnaire-template';

interface QuestionnaireTemplateContainerProps {
  sectionKey: string;
  /** Null mientras la sección todavía no se crea: se muestra como borrador. */
  template: ClinicalTemplate | null;
  draftName?: string;
  onDirtyChange: (sectionKey: string, isDirty: boolean) => void;
  onSaved?: (template: ClinicalTemplate) => void;
  /** Solo en el borrador: descartarlo antes de crearlo. */
  onCancel?: () => void;
}

/** Una sección propia de Preguntas: su nombre y sus preguntas, con el mismo editor de la historia. */
export const QuestionnaireTemplateContainer: React.FC<QuestionnaireTemplateContainerProps> = ({
  sectionKey,
  template,
  draftName = '',
  onDirtyChange,
  onSaved,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { initialValues, validationSchema, isPending, handleSubmit } = useQuestionnaireTemplate({
    template,
    draftName,
    onSaved,
  });
  const handleDirtyChange = useCallback(
    (isDirty: boolean) => onDirtyChange(sectionKey, isDirty),
    [onDirtyChange, sectionKey],
  );
  const nameId = `questionnaire-name-${sectionKey}`;

  return (
    <Formik<QuestionnaireTemplateFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
        <Form className="flex w-full flex-col gap-4">
          <FormDirtyReporter onDirtyChange={handleDirtyChange} />

          <label htmlFor={nameId} className="flex flex-col gap-1.5">
            <Typography variant={TypographyVariant.BODY}>
              {t(TEXT.QUESTIONS.SECTION_NAME)}
            </Typography>
            <input
              id={nameId}
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={QUESTIONNAIRE_NAME_MAX_LENGTH}
              placeholder={t(TEXT.QUESTIONS.SECTION_NAME_PLACEHOLDER)}
              className={inputBaseClasses}
            />
            {touched.name && errors.name && (
              <Typography variant={TypographyVariant.HELPER} className="text-danger">
                {errors.name}
              </Typography>
            )}
          </label>

          {/* Con el dedo no se arrastra: la indicación solo desde `sm`. */}
          <Typography variant={TypographyVariant.HELPER} className="hidden sm:block">
            {t(TEXT.CLINICAL_TEMPLATE.DRAG_HINT)}
          </Typography>

          <ClinicalTemplateEditor
            error={typeof errors.questions === 'string' ? errors.questions : undefined}
          />

          {/* Fija abajo: con muchas preguntas, guardar no obliga a bajar hasta el final. */}
          <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-ink-100 bg-white py-3">
            {!template && (
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXT.QUESTIONS.SECTION_NEW_HINT)}
              </Typography>
            )}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant={ButtonVariant.SECONDARY}
                  onClick={onCancel}
                  disabled={isPending}
                >
                  {t(TEXT.GENERAL.BUTTONS.CANCEL)}
                </Button>
              )}
              <Button
                type="submit"
                variant={ButtonVariant.PRIMARY}
                isLoading={isPending}
                disabled={!!template && !dirty}
              >
                {t(TEXT.GENERAL.BUTTONS.SAVE)}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
