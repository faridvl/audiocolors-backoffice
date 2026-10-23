import React from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
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
}

/** La hoja de la historia clínica, dentro de su tarjeta del expediente. */
export const PatientBackgroundForm: React.FC<PatientBackgroundFormProps> = ({
  patientUuid,
  background,
  fields,
  mode,
  onClose,
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

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form className="flex flex-col gap-6">
        <PatientBackgroundFields fields={fields} />

        <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          {/* El texto se acomoda; los botones no se parten en dos líneas. */}
          <Typography
            variant={TypographyVariant.HELPER}
            className="min-w-0 sm:flex-1 sm:text-right"
          >
            {t(
              isUpdate ? TEXT.PATIENTS.BACKGROUND.UPDATE.HINT : TEXT.PATIENTS.BACKGROUND.FINAL_HINT,
            )}
          </Typography>
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
            className="shrink-0 whitespace-nowrap"
          >
            {t(isUpdate ? TEXT.PATIENTS.BACKGROUND.UPDATE.SUBMIT : TEXT.GENERAL.BUTTONS.SAVE)}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
