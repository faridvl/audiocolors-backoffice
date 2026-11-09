import { useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import { CONTENT_LABEL_ID } from './document-template-editor-config';
import { DocumentTemplateFormValues } from './document-template-form';

/** Campos en el orden en que aparecen en pantalla; el id de cada uno es su nombre. */
const FIELD_ORDER: (keyof DocumentTemplateFormValues)[] = ['name', 'content'];

/** El mensaje de cada campo va arriba de la hoja: el rótulo lo deja visible bajo el borde superior. */
const SCROLL_ANCHOR_IDS: Partial<Record<keyof DocumentTemplateFormValues, string>> = {
  content: CONTENT_LABEL_ID,
};

/** Al intentar guardar con errores, lleva la vista al primer campo con error y lo enfoca. */
export function useFocusFirstError() {
  const { errors, isSubmitting, submitCount } = useFormikContext<DocumentTemplateFormValues>();
  const handledSubmitCount = useRef(0);

  useEffect(() => {
    if (isSubmitting || submitCount === handledSubmitCount.current) return;
    handledSubmitCount.current = submitCount;
    const firstField = FIELD_ORDER.find((name) => errors[name]);
    const element = firstField ? document.getElementById(firstField) : null;
    if (!firstField || !element) return;
    const anchorId = SCROLL_ANCHOR_IDS[firstField];
    const scrollTarget = (anchorId && document.getElementById(anchorId)) || element;
    scrollTarget.scrollIntoView({
      block: anchorId ? 'start' : 'center',
      behavior: 'smooth',
    });
    element.focus({ preventScroll: true });
  }, [errors, isSubmitting, submitCount]);
}
