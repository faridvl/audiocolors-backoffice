import React from 'react';
import { Editor, EditorContent } from '@tiptap/react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { FIELD_LABEL_CLASSES } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import {
  CONTENT_ERROR_ID,
  CONTENT_LABEL_ID,
  SHEET_BACKDROP_CLASSES,
} from './document-template-editor-config';
import { TOOLBAR_ACTIONS } from './document-template-format-toolbar';

interface DocumentTemplateContentFieldProps {
  editor: Editor | null;
}

/** El mensaje: barra de formato pegada a una hoja en blanco donde se escribe con el formato a la vista. */
export const DocumentTemplateContentField: React.FC<DocumentTemplateContentFieldProps> = ({
  editor,
}) => {
  const { t } = useTranslation();
  const [, { error, touched }] = useField<string>('content');
  const errorText = touched && error ? error : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        {/* Un contenteditable no se enlaza con `label for`: el clic en el título enfoca el editor. */}
        <div id={CONTENT_LABEL_ID} onClick={() => editor?.commands.focus()}>
          <Typography variant={TypographyVariant.BODY} className={FIELD_LABEL_CLASSES} inline>
            {t(TEXT.DOCUMENT_TEMPLATES.CONTENT)}
            <span className="ml-0.5 text-danger">*</span>
          </Typography>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-200">
        <div
          role="toolbar"
          aria-label={t(TEXT.DOCUMENT_TEMPLATES.TOOLBAR.LABEL)}
          className="flex flex-wrap gap-1 border-b border-ink-200 bg-white p-1.5"
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
                  'flex h-11 w-11 items-center justify-center rounded-md text-ink-700 transition-colors disabled:opacity-50 sm:h-10 sm:w-10 hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand',
                  isPressed && 'bg-brand-50 text-brand-700',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </button>
            );
          })}
        </div>

        <div className={SHEET_BACKDROP_CLASSES}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {errorText && (
        <Typography variant={TypographyVariant.ERROR} id={CONTENT_ERROR_ID}>
          {errorText}
        </Typography>
      )}
    </div>
  );
};
