import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormDirtyReporter } from '@/components/common/form/form-dirty-reporter';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalField } from '@/types/clinical-templates/clinical-template';
import { PatientBackground } from '@/types/patients/patient-background';
import { PatientBackgroundFields } from './patient-background-fields';
import { BackgroundFormMode, usePatientBackgroundForm } from './use-patient-background-form';

interface PatientBackgroundFormProps {
  patientUuid: string;
  background: PatientBackground | null;
  fields: ClinicalField[];
  mode: BackgroundFormMode;
  /** Al terminar de registrar un cambio, o al cancelarlo. */
  onClose: () => void;
  /** Avisa si está guardando, para que la tarjeta no se pueda cerrar a mitad del guardado. */
  onSavingChange: (isSaving: boolean) => void;
  /** Avisa si hay cambios sin guardar. */
  onDirtyChange: (isDirty: boolean) => void;
}

/** La hoja de la historia clínica, dentro de su tarjeta del expediente. */
export const PatientBackgroundForm: React.FC<PatientBackgroundFormProps> = ({
  patientUuid,
  background,
  fields,
  mode,
  onClose,
  onSavingChange,
  onDirtyChange,
}) => {
  const isUpdate = mode === BackgroundFormMode.UPDATE;
  const { t } = useTranslation();
  const { initialValues, isPending, handleSubmit } = usePatientBackgroundForm({
    patientUuid,
    background,
    fields,
    mode,
    onDone: onClose,
  });

  useEffect(() => {
    onSavingChange(isPending);
    return () => onSavingChange(false);
  }, [isPending, onSavingChange]);

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ dirty }) => (
        <Form className="flex flex-col gap-6">
          <FormDirtyReporter onDirtyChange={onDirtyChange} />
          <PatientBackgroundFields fields={fields} />

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 xl:flex-row xl:items-center xl:justify-end">
            {/* La nota larga va encima de los botones hasta `xl`; los botones no se parten en dos líneas. */}
            <Typography
              variant={TypographyVariant.HELPER}
              className="min-w-0 xl:flex-1 xl:text-right"
            >
              {t(
                isUpdate
                  ? TEXT.PATIENTS.BACKGROUND.UPDATE.HINT
                  : TEXT.PATIENTS.BACKGROUND.FINAL_HINT,
              )}
            </Typography>
            <div className="flex items-center justify-end gap-3">
              {isUpdate && (
                <Button
                  type="button"
                  variant={ButtonVariant.SECONDARY}
                  onClick={onClose}
                  disabled={isPending}
                  className="shrink-0 whitespace-nowrap"
                >
                  {t(TEXT.GENERAL.BUTTONS.CANCEL)}
                </Button>
              )}
              <Button
                type="submit"
                variant={ButtonVariant.PRIMARY}
                isLoading={isPending}
                disabled={isUpdate && !dirty}
                className="shrink-0 whitespace-nowrap"
              >
                {t(isUpdate ? TEXT.PATIENTS.BACKGROUND.UPDATE.SUBMIT : TEXT.GENERAL.BUTTONS.SAVE)}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
