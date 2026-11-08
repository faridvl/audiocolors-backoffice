import { useEffect, useMemo, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  DocumentNode,
  documentToMarkdown,
  DocumentNodeType,
  markdownToDocument,
} from '@/shared/utils/document-template-document';
import { findUsedVariables } from '@/shared/utils/document-template-text';
import { TEXT } from '@/static/texts/i18n';
import {
  DOCUMENT_TEMPLATE_VARIABLES,
  DocumentTemplateVariable,
} from '@/types/document-templates/document-template';
import { buildEditorAttributes, buildEditorExtensions } from './document-template-editor-config';
import { DocumentTemplateFormValues } from './document-template-form';

const CONTENT_FIELD = 'content';

/** El editor del mensaje: guarda en Formik el markdown de lo que se escribe y pinta el que llega. */
export function useDocumentTemplateContent() {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useFormikContext<DocumentTemplateFormValues>();
  const hasError = Boolean(touched.content && errors.content);
  // Último markdown que salió del editor: distingue un cambio propio de uno que llega de afuera.
  const lastMarkdown = useRef(values.content);

  const extensions = useMemo(
    () =>
      buildEditorExtensions({
        placeholder: t(TEXT.DOCUMENT_TEMPLATES.CONTENT_PLACEHOLDER),
        getVariableLabel: (name) =>
          DOCUMENT_TEMPLATE_VARIABLES.includes(name as DocumentTemplateVariable)
            ? t(`${TEXT.DOCUMENT_TEMPLATES.VARIABLES.ITEM_PREFIX}.${name}.label`)
            : null,
      }),
    [t],
  );

  const editor = useEditor({
    extensions,
    content: markdownToDocument(values.content),
    // Next renderiza primero en el servidor: el editor se crea ya en el navegador.
    immediatelyRender: false,
    editorProps: { attributes: buildEditorAttributes(hasError) },
    onUpdate: ({ editor: current }) => {
      const markdown = documentToMarkdown(current.getJSON() as DocumentNode);
      lastMarkdown.current = markdown;
      void setFieldValue(CONTENT_FIELD, markdown);
    },
    onBlur: () => {
      void setFieldTouched(CONTENT_FIELD, true);
    },
  });

  useEffect(() => {
    editor?.setOptions({
      editorProps: { attributes: buildEditorAttributes(hasError) },
    });
  }, [editor, hasError]);

  // Si el formulario cambia el mensaje por su cuenta (otra plantilla, reinicio), el editor lo sigue.
  useEffect(() => {
    if (!editor || values.content === lastMarkdown.current) return;
    lastMarkdown.current = values.content;
    editor.commands.setContent(markdownToDocument(values.content), false);
  }, [editor, values.content]);

  const handleInsertVariable = (variable: DocumentTemplateVariable) => {
    editor
      ?.chain()
      .focus()
      .insertContent({ type: DocumentNodeType.VARIABLE, attrs: { name: variable } })
      .run();
  };

  return {
    editor,
    usedVariables: findUsedVariables(values.content),
    handleInsertVariable,
  };
}
