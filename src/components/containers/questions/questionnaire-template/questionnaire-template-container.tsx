import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { ClinicalTemplateEditor } from '@/components/containers/clinical-history-template/clinical-template-editor';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import {
  ClinicalTemplate,
  QUESTIONNAIRE_NAME_MAX_LENGTH,
} from '@/types/clinical-templates/clinical-template';
import { SectionSaveBar } from '../section-save-bar';
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
  /** Dónde dibujar la barra de Guardar, fuera de la tarjeta de la sección. */
  footerSlot?: HTMLElement | null;
}

/** Una sección propia de Preguntas: su nombre y sus preguntas, con el mismo editor de la historia. */
export const QuestionnaireTemplateContainer: React.FC<QuestionnaireTemplateContainerProps> = ({
  sectionKey,
  template,
  draftName = '',
  onDirtyChange,
  onSaved,
  onCancel,
  footerSlot,
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
  const formId = `questionnaire-form-${sectionKey}`;
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  // El borrador recién nombrado puede quedar fuera de pantalla en el celular: se lleva a la vista.
  useEffect(() => {
    if (template) return;
    const input = nameInputRef.current;
    if (!input) return;
    input.focus();
    input.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [template]);

  return (
    <Formik<QuestionnaireTemplateFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, dirty, handleChange, handleBlur }) => (
        <Form id={formId} className={tailwind('flex w-full flex-col gap-4', !footerSlot && 'pb-2')}>
          <FormDirtyReporter onDirtyChange={handleDirtyChange} />

          <label htmlFor={nameId} className="flex scroll-mb-24 scroll-mt-4 flex-col gap-1.5">
            <span className="flex items-baseline justify-between gap-2">
              <Typography variant={TypographyVariant.BODY}>
                {t(TEXT.QUESTIONS.SECTION_NAME)}
              </Typography>
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXT.QUESTIONS.NAME_COUNTER, {
                  count: values.name.length,
                  max: QUESTIONNAIRE_NAME_MAX_LENGTH,
                })}
              </Typography>
            </span>
            <input
              ref={nameInputRef}
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
          <SectionSaveBar
            slot={footerSlot}
            label={t(TEXT.QUESTIONS.SAVE_BAR_LABEL, { title: template?.name ?? draftName })}
            hint={template ? undefined : t(TEXT.QUESTIONS.SECTION_NEW_HINT)}
          >
            {onCancel && (
              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                onClick={() =>
                  values.name.trim() || values.questions.length > 0
                    ? setIsConfirmingCancel(true)
                    : onCancel()
                }
                disabled={isPending}
              >
                {t(TEXT.GENERAL.BUTTONS.CANCEL)}
              </Button>
            )}
            <Button
              type="submit"
              form={formId}
              variant={ButtonVariant.PRIMARY}
              isLoading={isPending}
              disabled={!!template && !dirty}
            >
              {t(TEXT.GENERAL.BUTTONS.SAVE)}
            </Button>
          </SectionSaveBar>

          {isConfirmingCancel && (
            <ConfirmDialog
              title={t(TEXT.GENERAL.DISCARD.TITLE)}
              message={t(TEXT.GENERAL.DISCARD.MESSAGE)}
              confirmLabel={t(TEXT.GENERAL.DISCARD.CONFIRM)}
              cancelLabel={t(TEXT.GENERAL.DISCARD.KEEP_EDITING)}
              onConfirm={() => onCancel?.()}
              onCancel={() => setIsConfirmingCancel(false)}
            />
          )}
        </Form>
      )}
    </Formik>
  );
};
