import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { PatientBackgroundFields } from '@/components/containers/patients/patient-background/patient-background-fields';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplate } from '@/types/clinical-templates/clinical-template';
import { useQuestionnaireEntryForm } from './use-questionnaire-entry-form';

interface QuestionnaireEntryFormProps {
  patientUuid: string;
  template: ClinicalTemplate;
  onClose: () => void;
  /** Avisa si está guardando, para que la sección no se pueda cerrar a mitad del guardado. */
  onSavingChange: (isSaving: boolean) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

/** Un registro nuevo de una sección propia: las preguntas actuales, sin responder. */
export const QuestionnaireEntryForm: React.FC<QuestionnaireEntryFormProps> = ({
  patientUuid,
  template,
  onClose,
  onSavingChange,
  onDirtyChange,
}) => {
  const { t } = useTranslation();
  const { initialValues, isPending, handleSubmit } = useQuestionnaireEntryForm({
    patientUuid,
    template,
    onDone: onClose,
  });

  useEffect(() => {
    onSavingChange(isPending);
    return () => onSavingChange(false);
  }, [isPending, onSavingChange]);

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form className="flex flex-col gap-6">
        <FormDirtyReporter onDirtyChange={onDirtyChange} />
        <PatientBackgroundFields fields={template.fields} showsHistoryTitle={false} />

        <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 xl:flex-row xl:items-center xl:justify-end">
          <Typography
            variant={TypographyVariant.HELPER}
            className="min-w-0 xl:flex-1 xl:text-right"
          >
            {t(TEXT.QUESTIONS.ENTRY_HINT)}
          </Typography>
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant={ButtonVariant.SECONDARY}
              onClick={onClose}
              disabled={isPending}
              className="shrink-0 whitespace-nowrap"
            >
              {t(TEXT.GENERAL.BUTTONS.CANCEL)}
            </Button>
            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              isLoading={isPending}
              className="shrink-0 whitespace-nowrap"
            >
              {t(TEXT.QUESTIONS.ENTRY_SAVE)}
            </Button>
          </div>
        </div>
      </Form>
    </Formik>
  );
};
