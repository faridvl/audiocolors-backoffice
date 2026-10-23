import React from 'react';
import { FieldArray, Form, Formik } from 'formik';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { CLINICAL_TEMPLATE_MAX_FIELDS } from '@/types/clinical-templates/clinical-template';
import { ClinicalQuestionCard } from './clinical-question-card';
import { buildEmptyQuestion, ClinicalTemplateFormValues } from './clinical-template-form';
import { useClinicalHistoryTemplate } from './use-clinical-history-template';

export const ClinicalHistoryTemplateContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    canEdit,
    isSessionLoading,
    initialValues,
    validationSchema,
    isLoading,
    isError,
    refetch,
    isPending,
    handleSubmit,
  } = useClinicalHistoryTemplate();

  if (isLoading || isSessionLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>
          {t(TEXT.CLINICAL_TEMPLATE.LOADING)}
        </Typography>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <Typography variant={TypographyVariant.BODY}>
          {t(TEXT.CLINICAL_TEMPLATE.FORBIDDEN)}
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
      {({ values, errors }) => (
        <Form className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-24">
          <Typography variant={TypographyVariant.BODY} className="text-ink-600">
            {t(TEXT.CLINICAL_TEMPLATE.INTRO)}
          </Typography>

          <FieldArray name="questions">
            {({ move, remove, push }) => {
              const isFull = values.questions.length >= CLINICAL_TEMPLATE_MAX_FIELDS;
              const lastSection = values.questions[values.questions.length - 1]?.section ?? '';

              return (
                <div className="flex flex-col gap-3">
                  {values.questions.map((question, index) => (
                    <ClinicalQuestionCard
                      key={question.id}
                      index={index}
                      question={question}
                      isFirst={index === 0}
                      isLast={index === values.questions.length - 1}
                      canRemove={values.questions.length > 1}
                      onMoveUp={() => move(index, index - 1)}
                      onMoveDown={() => move(index, index + 1)}
                      onRemove={() => remove(index)}
                    />
                  ))}

                  {typeof errors.questions === 'string' && (
                    <Typography variant={TypographyVariant.ERROR}>{errors.questions}</Typography>
                  )}

                  {isFull ? (
                    <Typography variant={TypographyVariant.HELPER}>
                      {t(TEXT.CLINICAL_TEMPLATE.MAX_REACHED, {
                        max: CLINICAL_TEMPLATE_MAX_FIELDS,
                      })}
                    </Typography>
                  ) : (
                    <Button
                      type="button"
                      variant={ButtonVariant.SECONDARY}
                      className="w-fit"
                      onClick={() => push(buildEmptyQuestion(lastSection))}
                      icon={<Plus className="h-4 w-4" aria-hidden />}
                    >
                      {t(TEXT.CLINICAL_TEMPLATE.ADD)}
                    </Button>
                  )}
                </div>
              );
            }}
          </FieldArray>

          {/* Fija abajo: con muchas preguntas, guardar no obliga a bajar hasta el final. */}
          <div className="sticky bottom-16 z-10 flex justify-end border-t border-ink-100 bg-white/95 py-3 backdrop-blur lg:bottom-0">
            <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isPending}>
              {t(TEXT.GENERAL.BUTTONS.SAVE)}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
