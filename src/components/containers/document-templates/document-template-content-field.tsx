import React, { useEffect, useRef, useState } from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import { Braces } from 'lucide-react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { FIELD_LABEL_CLASSES } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { DocumentTemplateVariable } from '@/types/document-templates/document-template';
import { tailwind } from '@/utils/tailwind-utils';
import {
  CONTENT_ERROR_ID,
  CONTENT_LABEL_ID,
  SHEET_BACKDROP_CLASSES,
} from './document-template-editor-config';
import { TOOLBAR_ACTIONS } from './document-template-format-toolbar';
import { DocumentTemplateVariableChips } from './document-template-variable-chips';

interface DocumentTemplateContentFieldProps {
  editor: Editor | null;
  usedVariables: Set<string>;
  onInsertVariable: (variable: DocumentTemplateVariable) => void;
}

const TOOLBAR_BUTTON_CLASSES =
  'flex h-11 w-11 items-center justify-center rounded-md text-ink-700 transition-colors hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50 sm:h-10 sm:w-10';

/** El texto del documento: barra de formato flotante sobre una hoja en blanco con el formato a la vista. */
export const DocumentTemplateContentField: React.FC<DocumentTemplateContentFieldProps> = ({
  editor,
  usedVariables,
  onInsertVariable,
}) => {
  const { t } = useTranslation();
  const [, { error, touched }] = useField<string>('content');
  const errorText = touched && error ? error : undefined;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setIsMenuOpen(false);
      editor?.commands.focus();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isMenuOpen, editor]);

  const handleInsert = (variable: DocumentTemplateVariable) => {
    onInsertVariable(variable);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Un contenteditable no se enlaza con `label for`: el clic en el título enfoca el editor. */}
      <div id={CONTENT_LABEL_ID} onClick={() => editor?.commands.focus()}>
        <Typography variant={TypographyVariant.BODY} className={FIELD_LABEL_CLASSES} inline>
          {t(TEXT.DOCUMENT_TEMPLATES.CONTENT)}
          <span className="ml-0.5 text-danger">*</span>
        </Typography>
      </div>

      {errorText && (
        <Typography variant={TypographyVariant.ERROR} id={CONTENT_ERROR_ID}>
          {errorText}
        </Typography>
      )}

      <div
        className={tailwind(
          'relative overflow-clip rounded-card bg-ink-50 focus-within:ring-1 focus-within:ring-brand/30',
          errorText && 'ring-1 ring-danger focus-within:ring-danger',
        )}
      >
        <div ref={barRef} className="sticky top-2 z-10 mx-auto mt-3 w-fit max-w-full">
          <div
            role="toolbar"
            aria-label={t(TEXT.DOCUMENT_TEMPLATES.TOOLBAR.LABEL)}
            className="flex w-fit max-w-full flex-wrap gap-1 rounded-card bg-white p-1.5 shadow-sm"
          >
            {TOOLBAR_ACTIONS.map(({ format, icon: Icon, labelKey, isActive, run }) => {
              const isPressed = editor ? isActive(editor) : false;
              return (
                <button
                  key={format}
                  type="button"
                  title={t(labelKey)}
                  aria-label={t(labelKey)}
                  aria-pressed={isPressed}
                  disabled={!editor}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor && run(editor)}
                  className={tailwind(
                    TOOLBAR_BUTTON_CLASSES,
                    isPressed && 'bg-brand-50 text-brand-700',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </button>
              );
            })}
            <button
              type="button"
              title={t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INSERT_BUTTON)}
              aria-label={t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INSERT_BUTTON)}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              disabled={!editor}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
              className={tailwind(
                TOOLBAR_BUTTON_CLASSES,
                'gap-1.5 text-sm font-medium sm:w-auto sm:px-3 xl:hidden',
                isMenuOpen && 'bg-brand-50 text-brand-700',
              )}
            >
              <Braces className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">
                {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INSERT_BUTTON)}
              </span>
            </button>
          </div>

          {isMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 max-h-[60dvh] w-[min(20rem,100%)] overflow-y-auto rounded-card bg-white p-3 shadow-lg xl:hidden">
              <DocumentTemplateVariableChips
                usedVariables={usedVariables}
                onInsert={handleInsert}
              />
            </div>
          )}
        </div>

        <div className={SHEET_BACKDROP_CLASSES}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
