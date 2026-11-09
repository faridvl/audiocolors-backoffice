import React, { useEffect, useState } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { PatientBackgroundFields } from '@/components/containers/patients/patient-background/patient-background-fields';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalTemplate } from '@/types/clinical-templates/clinical-template';
import { QuestionnaireEntry } from '@/types/questionnaires/questionnaire-entry';
import { useQuestionnaireEntryForm } from './use-questionnaire-entry-form';

interface QuestionnaireEntryFormProps {
  patientUuid: string;
  template: ClinicalTemplate;
  /** Con un registro, el mismo formulario lo corrige, precargado con sus respuestas. */
  entry?: QuestionnaireEntry;
  onClose: () => void;
  /** Se llama al guardar bien, antes de cerrar. */
  onSaved?: () => void;
  /** Avisa si está guardando, para que la sección no se pueda cerrar a mitad del guardado. */
  onSavingChange: (isSaving: boolean) => void;
  onDirtyChange: (isDirty: boolean) => void;
}

/** Borra el aviso de registro vacío en cuanto la persona cambia una respuesta. */
const EmptyErrorResetter: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { values } = useFormikContext();

  useEffect(() => {
    onReset();
  }, [values, onReset]);

  return null;
};

/** Un registro de una sección propia: nuevo (preguntas de hoy, sin responder) o la corrección de uno. */
export const QuestionnaireEntryForm: React.FC<QuestionnaireEntryFormProps> = ({
  patientUuid,
  template,
  entry,
  onClose,
  onSaved,
  onSavingChange,
  onDirtyChange,
}) => {
  const { t } = useTranslation();
  const {
    initialValues,
    fields,
    isEditing,
    isPending,
    isEmpty,
    staleMessage,
    clearEmptyError,
    handleSubmit,
    handleSaveAsNew,
  } = useQuestionnaireEntryForm({
    patientUuid,
    template,
    entry,
    onDone: onClose,
    onSaved,
  });
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  useEffect(() => {
    onSavingChange(isPending);
    return () => onSavingChange(false);
  }, [isPending, onSavingChange]);

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ dirty, values }) => (
        <Form className="flex flex-col gap-6">
          <FormDirtyReporter onDirtyChange={onDirtyChange} />
          <EmptyErrorResetter onReset={clearEmptyError} />
          <PatientBackgroundFields
            fields={fields}
            showsHistoryTitle={false}
            hasCardBorder={false}
          />

          {isEmpty && (
            <div role="alert">
              <Typography variant={TypographyVariant.ERROR}>
                {t(TEXT.QUESTIONS.ENTRY_EMPTY_ERROR)}
              </Typography>
            </div>
          )}

          {staleMessage && (
            <div role="alert" className="flex flex-col gap-1">
              <Typography variant={TypographyVariant.ERROR}>{staleMessage}</Typography>
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXT.QUESTIONS.ENTRY_STALE_HINT)}
              </Typography>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 xl:flex-row xl:items-center xl:justify-end">
            {!staleMessage && (
              <Typography
                variant={TypographyVariant.HELPER}
                className="min-w-0 xl:flex-1 xl:text-right"
              >
                {t(TEXT.QUESTIONS.ENTRY_HINT)}
              </Typography>
            )}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                onClick={dirty ? () => setIsConfirmingCancel(true) : onClose}
                disabled={isPending}
                className="shrink-0 whitespace-nowrap"
              >
                {t(TEXT.GENERAL.BUTTONS.CANCEL)}
              </Button>
              {staleMessage ? (
                <Button
                  type="button"
                  variant={ButtonVariant.PRIMARY}
                  isLoading={isPending}
                  disabled={isPending}
                  onClick={() => handleSaveAsNew(values)}
                  className="min-w-0"
                >
                  {t(TEXT.QUESTIONS.ENTRY_SAVE_AS_NEW)}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant={ButtonVariant.PRIMARY}
                  isLoading={isPending}
                  disabled={isPending}
                  className="shrink-0 whitespace-nowrap"
                >
                  {t(isEditing ? TEXT.QUESTIONS.ENTRY_EDIT_SAVE : TEXT.QUESTIONS.ENTRY_SAVE)}
                </Button>
              )}
            </div>
          </div>

          {isConfirmingCancel && (
            <ConfirmDialog
              title={t(TEXT.GENERAL.DISCARD.TITLE)}
              message={t(TEXT.GENERAL.DISCARD.MESSAGE)}
              confirmLabel={t(TEXT.GENERAL.DISCARD.CONFIRM)}
              cancelLabel={t(TEXT.GENERAL.DISCARD.KEEP_EDITING)}
              onConfirm={onClose}
              onCancel={() => setIsConfirmingCancel(false)}
            />
          )}
        </Form>
      )}
    </Formik>
  );
};
