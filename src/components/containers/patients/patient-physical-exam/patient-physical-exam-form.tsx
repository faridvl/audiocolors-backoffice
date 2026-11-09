import React from 'react';
import { Formik } from 'formik';
import { PhysicalExamFormBody } from './physical-exam-form-body';
import { OtoscopyFormValues, useOtoscopyEntryForm } from './use-otoscopy-entry-form';

interface PatientPhysicalExamFormProps {
  patientUuid: string;
}

const INITIAL_VALUES: OtoscopyFormValues = {
  otoscopyRight: '',
  otoscopyLeft: '',
};

/** OD y OI en dos cuadros de texto; al guardar se limpian para otra otoscopia. */
export const PatientPhysicalExamForm: React.FC<PatientPhysicalExamFormProps> = ({
  patientUuid,
}) => {
  const { isPending, isEmpty, clearEmptyError, handleSubmit } = useOtoscopyEntryForm({
    patientUuid,
  });

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      onSubmit={(values, { resetForm }) => handleSubmit(values, () => resetForm())}
    >
      <PhysicalExamFormBody isPending={isPending} isEmpty={isEmpty} onChange={clearEmptyError} />
    </Formik>
  );
};
