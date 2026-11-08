import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FIELD_LABEL_CLASSES, FormField } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { DOCUMENT_TEMPLATE_NAME_MAX_LENGTH } from '@/types/document-templates/document-template';
import { DocumentTemplateContentField } from './document-template-content-field';
import { DocumentTemplateExampleModal } from './document-template-example-modal';
import { DocumentTemplateFormValues } from './document-template-form';
import { DocumentTemplateVariablesPanel } from './document-template-variables-panel';
import { useDocumentTemplateContent } from './use-document-template-content';
import { useFocusFirstError } from './use-focus-first-error';

interface DocumentTemplateEditorFieldsProps {
  title: string;
  isSaving: boolean;
  onCancel: () => void;
}

export const DocumentTemplateEditorFields: React.FC<DocumentTemplateEditorFieldsProps> = ({
  title,
  isSaving,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<DocumentTemplateFormValues>();
  const { editor, usedVariables, handleInsertVariable } = useDocumentTemplateContent();
  useFocusFirstError();
  const [isExampleOpen, setIsExampleOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={ButtonVariant.GHOST}
          onClick={onCancel}
          icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
          className="shrink-0 px-2 sm:px-4"
        >
          {t(TEXT.DOCUMENT_TEMPLATES.BACK)}
        </Button>
        <Typography variant={TypographyVariant.ACCENT} className="min-w-0 flex-1 truncate">
          {title}
        </Typography>
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={() => setIsExampleOpen(true)}
          className="shrink-0 px-3 sm:px-4"
        >
          {t(TEXT.DOCUMENT_TEMPLATES.VIEW_EXAMPLE)}
        </Button>
      </div>

      <FormField
        name="name"
        label={t(TEXT.DOCUMENT_TEMPLATES.NAME)}
        labelClassName={FIELD_LABEL_CLASSES}
        placeholder={t(TEXT.DOCUMENT_TEMPLATES.NAME_PLACEHOLDER)}
        maxLength={DOCUMENT_TEMPLATE_NAME_MAX_LENGTH}
        required
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-start">
        <DocumentTemplateContentField editor={editor} />
        <DocumentTemplateVariablesPanel
          usedVariables={usedVariables}
          onInsert={handleInsertVariable}
        />
      </div>

      {/* Pegada al borde de abajo y opaca: en una pantalla baja el botón principal siempre se alcanza. */}
      <div
        className="sticky bottom-0 z-10 grid grid-cols-3 gap-2 border-t border-ink-200 bg-white pt-3 sm:flex sm:justify-end"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isSaving}>
          {t(TEXT.GENERAL.BUTTONS.CANCEL)}
        </Button>
        <Button
          type="submit"
          variant={ButtonVariant.PRIMARY}
          isLoading={isSaving}
          className="col-span-2"
        >
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
