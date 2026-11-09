import React, { useEffect, useRef } from 'react';
import { FormikErrors, useFormikContext } from 'formik';

/** Rutas de los campos con error (`contacts.0.phone`), de cualquier profundidad. */
function collectErrorPaths(errors: FormikErrors<unknown>, prefix = ''): string[] {
  return Object.entries(errors).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') return [path];
    if (value && typeof value === 'object') return collectErrorPaths(value, path);
    return [];
  });
}

/**
 * Va dentro de un Formik: al intentar guardar con errores, lleva la vista y el foco al
 * primer campo con error (en el orden de la pantalla, no el del esquema).
 */
export const FocusFirstError: React.FC = () => {
  const { errors, submitCount, isValid } = useFormikContext();
  const handledSubmitCount = useRef(0);

  useEffect(() => {
    if (submitCount === handledSubmitCount.current || isValid) return;
    handledSubmitCount.current = submitCount;

    const fields = collectErrorPaths(errors)
      .map((path) => document.getElementById(path))
      .filter((element): element is HTMLElement => element !== null)
      .sort((first, second) =>
        first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );

    fields[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    fields[0]?.focus({ preventScroll: true });
  }, [errors, submitCount, isValid]);

  return null;
};
