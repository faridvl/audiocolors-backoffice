import React from 'react';
import { Formik } from 'formik';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { patientEditValidationSchema } from '../patient-validation';
import { PatientFormFields } from '../patient-form';
import { usePatientEdit } from './use-patient-edit';

interface PatientEditContainerProps {
  uuid: string;
}

export const PatientEditContainer: React.FC<PatientEditContainerProps> = ({ uuid }) => {
  const { initialValues, isLoading, isError, isPending, errorMessage, handleSubmit, handleCancel } =
    usePatientEdit(uuid);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>Cargando paciente...</Typography>
      </div>
    );
  }

  if (isError || !initialValues) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <AlertCircle className="h-8 w-8 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.CARD_TITLE}>
          No se pudo cargar el paciente
        </Typography>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.BODY} className="text-navy-700">
            {errorMessage}
          </Typography>
        </div>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={patientEditValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <PatientFormFields
          submitLabel="Guardar cambios"
          isSubmitting={isPending}
          onCancel={handleCancel}
          maskPhone={false}
        />
      </Formik>
    </div>
  );
};
