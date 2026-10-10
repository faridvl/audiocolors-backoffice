import React from 'react';
import { Formik } from 'formik';
import { AlertCircle } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { patientCreateValidationSchema } from '../patient-validation';
import { PatientFormFields } from '../patient-form';
import { usePatientCreate, patientCreateInitialValues } from './use-patient-create';

export const PatientCreateContainer: React.FC = () => {
  const { handleSubmit, isPending, errorMessage, handleCancel } = usePatientCreate();

  return (
    <div className="mx-auto w-full max-w-3xl">
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.BODY} className="text-ink-700">
            {errorMessage}
          </Typography>
        </div>
      )}

      <Formik
        initialValues={patientCreateInitialValues}
        validationSchema={patientCreateValidationSchema}
        onSubmit={handleSubmit}
      >
        <PatientFormFields
          submitLabel="Registrar paciente"
          isSubmitting={isPending}
          onCancel={handleCancel}
        />
      </Formik>
    </div>
  );
};
