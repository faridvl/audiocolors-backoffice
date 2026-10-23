import React from 'react';
import { FieldArray, Form, Formik } from 'formik';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  CLINICAL_SECTION_MAX_LENGTH,
  CLINICAL_TEMPLATE_MAX_FIELDS,
} from '@/types/clinical-templates/clinical-template';
import { ClinicalQuestionRow } from './clinical-question-row';
import {
  buildEmptyQuestion,
  ClinicalTemplateFormValues,
  groupQuestionsBySection,
} from './clinical-template-form';
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
    newSectionName,
    handleNewSectionNameChange,
    clearNewSectionName,
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
        <Form className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Typography variant={TypographyVariant.BODY} className="text-ink-600">
            {t(TEXT.CLINICAL_TEMPLATE.INTRO)}
          </Typography>

          <FieldArray name="questions">
            {({ insert, remove, push }) => {
              const isFull = values.questions.length >= CLINICAL_TEMPLATE_MAX_FIELDS;
              const canRemove = values.questions.length > 1;

              return (
                <div className="flex flex-col gap-4">
                  {groupQuestionsBySection(values.questions).map((group) => (
                    <section
                      key={group.section}
                      className="flex flex-col rounded-lg border border-ink-200 bg-white px-3 pb-2 pt-3 sm:px-4"
                    >
                      <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
                        {group.section || t(TEXT.CLINICAL_TEMPLATE.NO_SECTION)}
                      </Typography>
                      {group.indexes.map((index) => (
                        <ClinicalQuestionRow
                          key={values.questions[index].id}
                          index={index}
                          question={values.questions[index]}
                          canRemove={canRemove}
                          onRemove={() => remove(index)}
                        />
                      ))}
                      {!isFull && (
                        <Button
                          type="button"
                          variant={ButtonVariant.GHOST}
                          className="w-fit px-2 text-brand-600 hover:text-brand-700"
                          onClick={() =>
                            insert(
                              group.indexes[group.indexes.length - 1] + 1,
                              buildEmptyQuestion(group.section),
                            )
                          }
                          icon={<Plus className="h-4 w-4" aria-hidden />}
                        >
                          {t(TEXT.CLINICAL_TEMPLATE.ADD)}
                        </Button>
                      )}
                    </section>
                  ))}

                  {typeof errors.questions === 'string' && (
                    <Typography variant={TypographyVariant.ERROR}>{errors.questions}</Typography>
                  )}

                  {isFull ? (
                    <Typography variant={TypographyVariant.HELPER}>
                      {t(TEXT.CLINICAL_TEMPLATE.MAX_REACHED, { max: CLINICAL_TEMPLATE_MAX_FIELDS })}
                    </Typography>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={newSectionName}
                        onChange={(event) => handleNewSectionNameChange(event.target.value)}
                        aria-label={t(TEXT.CLINICAL_TEMPLATE.NEW_SECTION)}
                        placeholder={t(TEXT.CLINICAL_TEMPLATE.NEW_SECTION)}
                        maxLength={CLINICAL_SECTION_MAX_LENGTH}
                        className={inputBaseClasses}
                      />
                      <Button
                        type="button"
                        variant={ButtonVariant.SECONDARY}
                        className="shrink-0"
                        disabled={!newSectionName.trim()}
                        onClick={() => {
                          push(buildEmptyQuestion(newSectionName.trim()));
                          clearNewSectionName();
                        }}
                        icon={<Plus className="h-4 w-4" aria-hidden />}
                      >
                        {t(TEXT.CLINICAL_TEMPLATE.ADD_SECTION)}
                      </Button>
                    </div>
                  )}
                </div>
              );
            }}
          </FieldArray>

          <div className="flex justify-end">
            <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isPending}>
              {t(TEXT.GENERAL.BUTTONS.SAVE)}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
