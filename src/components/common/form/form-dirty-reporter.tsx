import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';

interface FormDirtyReporterProps {
  onDirtyChange: (isDirty: boolean) => void;
}

/** Va dentro de un Formik: avisa a quien esté afuera si hay cambios sin guardar. */
export const FormDirtyReporter: React.FC<FormDirtyReporterProps> = ({ onDirtyChange }) => {
  const { dirty } = useFormikContext();

  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  return null;
};
