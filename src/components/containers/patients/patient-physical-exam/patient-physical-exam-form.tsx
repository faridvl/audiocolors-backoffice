import React, { useEffect } from 'react';
import { Formik } from 'formik';
import { OtoscopyEntry } from '@/types/patients/otoscopy-entry';
import { PhysicalExamFormBody } from './physical-exam-form-body';
import { useOtoscopyEntryForm } from './use-otoscopy-entry-form';

interface PatientPhysicalExamFormProps {
  patientUuid: string;
  /** Con un registro, el mismo formulario lo corrige, precargado con sus textos. */
  entry?: OtoscopyEntry;
  onClose: () => void;
  /** Se llama al guardar bien, antes de cerrar. */
  onSaved?: () => void;
  /** Avisa si está guardando, para que la tarjeta no se pueda tocar a mitad del guardado. */
  onSavingChange: (isSaving: boolean) => void;
}

/** OD y OI en dos cuadros de texto: una otoscopia nueva o la corrección de una de hoy. */
export const PatientPhysicalExamForm: React.FC<PatientPhysicalExamFormProps> = ({
  patientUuid,
  entry,
  onClose,
  onSaved,
  onSavingChange,
}) => {
  const {
    initialValues,
    isEditing,
    isPending,
    isEmpty,
    staleMessage,
    clearEmptyError,
    handleSubmit,
    handleSaveAsNew,
  } = useOtoscopyEntryForm({ patientUuid, entry, onDone: onClose, onSaved });

  useEffect(() => {
    onSavingChange(isPending);
    return () => onSavingChange(false);
  }, [isPending, onSavingChange]);

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <PhysicalExamFormBody
        isEditing={isEditing}
        isPending={isPending}
        isEmpty={isEmpty}
        staleMessage={staleMessage}
        onChange={clearEmptyError}
        onSaveAsNew={handleSaveAsNew}
        onCancel={onClose}
      />
    </Formik>
  );
};
