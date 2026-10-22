import React from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackground } from '@/types/patients/patient-background';
import { PatientBackgroundFields } from './patient-background-fields';
import { usePatientBackgroundForm } from './use-patient-background-form';

interface PatientBackgroundFormProps {
  patientUuid: string;
  background: PatientBackground | null;
}

/** La hoja de la historia clínica, dentro de su tarjeta del expediente. */
export const PatientBackgroundForm: React.FC<PatientBackgroundFormProps> = ({
  patientUuid,
  background,
}) => {
  const { t } = useTranslation();
  const { initialValues, isPending, handleSubmit } = usePatientBackgroundForm(
    patientUuid,
    background,
  );

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form className="flex flex-col gap-6">
        <PatientBackgroundFields />

        <div className="flex flex-col gap-3 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.PATIENTS.BACKGROUND.FINAL_HINT)}
          </Typography>
          <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isPending}>
            {t(TEXT.GENERAL.BUTTONS.SAVE)}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
