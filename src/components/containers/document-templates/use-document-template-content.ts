import { useLayoutEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import {
  applyTextFormat,
  findUsedVariables,
  insertAtSelection,
  TextEdit,
  TextFormat,
  variableToken,
} from '@/shared/utils/document-template-text';
import { DocumentTemplateVariable } from '@/types/document-templates/document-template';
import { DocumentTemplateFormValues } from './document-template-form';

interface PendingSelection {
  start: number;
  end: number;
}

/** El área del mensaje: aplica el formato y las variables sobre lo que el cursor tiene seleccionado. */
export function useDocumentTemplateContent() {
  const { values, setFieldValue } = useFormikContext<DocumentTemplateFormValues>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<PendingSelection | null>(null);

  // El valor cambia por Formik; la selección se devuelve al área una vez pintado el texto nuevo.
  useLayoutEffect(() => {
    const selection = pendingSelection.current;
    const textarea = textareaRef.current;
    if (!selection || !textarea) return;
    pendingSelection.current = null;
    textarea.focus();
    textarea.setSelectionRange(selection.start, selection.end);
  }, [values.content]);

  const readSelection = () => {
    const textarea = textareaRef.current;
    const end = values.content.length;
    return {
      start: textarea?.selectionStart ?? end,
      end: textarea?.selectionEnd ?? end,
    };
  };

  const applyEdit = (edit: TextEdit) => {
    pendingSelection.current = { start: edit.selectionStart, end: edit.selectionEnd };
    void setFieldValue('content', edit.value);
  };

  const handleFormat = (format: TextFormat) => {
    const { start, end } = readSelection();
    applyEdit(applyTextFormat(values.content, start, end, format));
  };

  const handleInsertVariable = (variable: DocumentTemplateVariable) => {
    const { start, end } = readSelection();
    applyEdit(insertAtSelection(values.content, start, end, variableToken(variable)));
  };

  return {
    textareaRef,
    usedVariables: findUsedVariables(values.content),
    handleFormat,
    handleInsertVariable,
  };
}
