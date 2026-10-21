import React from 'react';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackground } from '@/types/patients/patient-background';
import { PatientBackgroundFields } from './patient-background-fields';
import { usePatientBackgroundForm } from './use-patient-background-form';

interface PatientBackgroundFormProps {
  patientUuid: string;
  background: PatientBackground | null;
  onSaved: () => void;
  /** Solo al editar una ya llena: la primera vez no hay a dónde volver. */
  onCancel?: () => void;
}

/** La hoja de la historia clínica, dentro de su tarjeta del expediente. */
export const PatientBackgroundForm: React.FC<PatientBackgroundFormProps> = ({
  patientUuid,
  background,
  onSaved,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { initialValues, isPending, handleSubmit } = usePatientBackgroundForm(
    patientUuid,
    background,
    onSaved,
  );

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <Form className="flex flex-col gap-6">
        <PatientBackgroundFields />

        <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:justify-end">
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
          <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isPending}>
            {t(TEXT.GENERAL.BUTTONS.SAVE)}
          </Button>
        </div>
      </Form>
    </Formik>
  );
};
