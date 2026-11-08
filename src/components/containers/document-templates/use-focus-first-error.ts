import { useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import { DocumentTemplateFormValues } from './document-template-form';

/** Campos en el orden en que aparecen en pantalla; el id de cada uno es su nombre. */
const FIELD_ORDER: (keyof DocumentTemplateFormValues)[] = ['name', 'content'];

/** Al intentar guardar con errores, lleva la vista al primer campo con error y lo enfoca. */
export function useFocusFirstError() {
  const { errors, isSubmitting, submitCount } = useFormikContext<DocumentTemplateFormValues>();
  const handledSubmitCount = useRef(0);

  useEffect(() => {
    if (isSubmitting || submitCount === handledSubmitCount.current) return;
    handledSubmitCount.current = submitCount;
    const firstField = FIELD_ORDER.find((name) => errors[name]);
    const element = firstField ? document.getElementById(firstField) : null;
    if (!element) return;
    // El mensaje queda bajo el campo: se centra él para que la barra fija no lo tape.
    const scrollTarget = document.getElementById(`${firstField}-error`) ?? element;
    scrollTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
    element.focus({ preventScroll: true });
  }, [errors, isSubmitting, submitCount]);
}
