import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { TEXT } from '@/static/texts/i18n';
import {
  DOCUMENT_TEMPLATE_DESCRIPTION_MAX_LENGTH,
  DOCUMENT_TEMPLATE_NAME_MAX_LENGTH,
} from '@/types/document-templates/document-template';
import { DocumentTemplateContentField } from './document-template-content-field';
import { DocumentTemplateExampleModal } from './document-template-example-modal';
import { DocumentTemplateFormValues } from './document-template-form';
import { DocumentTemplateVariablesPanel } from './document-template-variables-panel';
import { useDocumentTemplateContent } from './use-document-template-content';

interface DocumentTemplateEditorFieldsProps {
  isSaving: boolean;
  onCancel: () => void;
}

export const DocumentTemplateEditorFields: React.FC<DocumentTemplateEditorFieldsProps> = ({
  isSaving,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DocumentTemplateFormValues>();
  const { textareaRef, usedVariables, handleFormat, handleInsertVariable } =
    useDocumentTemplateContent();
  const [isExampleOpen, setIsExampleOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start">
        <div className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              name="name"
              label={t(TEXT.DOCUMENT_TEMPLATES.NAME)}
              placeholder={t(TEXT.DOCUMENT_TEMPLATES.NAME_PLACEHOLDER)}
              maxLength={DOCUMENT_TEMPLATE_NAME_MAX_LENGTH}
              required
            />
            <FormField
              name="description"
              label={t(TEXT.DOCUMENT_TEMPLATES.DESCRIPTION)}
              placeholder={t(TEXT.DOCUMENT_TEMPLATES.DESCRIPTION_PLACEHOLDER)}
              maxLength={DOCUMENT_TEMPLATE_DESCRIPTION_MAX_LENGTH}
              optional
            />
          </div>
          <DocumentTemplateContentField
            textareaRef={textareaRef}
            onFormat={handleFormat}
            onViewExample={() => setIsExampleOpen(true)}
          />
        </div>

        <DocumentTemplateVariablesPanel
          usedVariables={usedVariables}
          onInsert={handleInsertVariable}
        />
      </div>

      {/* Pegada al borde de abajo: en una pantalla baja el botón principal siempre se alcanza. */}
      <div
        className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-ink-200 bg-white/95 pt-3 sm:flex-row sm:justify-end"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isSaving}>
          {t(TEXT.GENERAL.BUTTONS.CANCEL)}
        </Button>
        <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isSaving}>
          {t(TEXT.GENERAL.BUTTONS.SAVE)}
        </Button>
      </div>

      {isExampleOpen && (
        <DocumentTemplateExampleModal
          content={values.content}
          onClose={() => setIsExampleOpen(false)}
        />
      )}
    </>
  );
};
