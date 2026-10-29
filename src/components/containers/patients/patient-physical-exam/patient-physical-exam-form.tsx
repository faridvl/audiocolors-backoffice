import React from 'react';
import { Formik } from 'formik';
import { PhysicalExamFormBody } from './physical-exam-form-body';
import { PhysicalExamFormValues } from './use-patient-physical-exam';

interface PatientPhysicalExamFormProps {
  initialValues: PhysicalExamFormValues;
  isPending: boolean;
  onSubmit: (values: PhysicalExamFormValues) => void;
  onCancel: () => void;
}

/** OD y OI en dos cuadros de texto; se puede editar cuantas veces haga falta. */
export const PatientPhysicalExamForm: React.FC<PatientPhysicalExamFormProps> = ({
  initialValues,
  isPending,
  onSubmit,
  onCancel,
}) => (
  <Formik initialValues={initialValues} onSubmit={onSubmit}>
    <PhysicalExamFormBody isPending={isPending} onCancel={onCancel} />
  </Formik>
);
