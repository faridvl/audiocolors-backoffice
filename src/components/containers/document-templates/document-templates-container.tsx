import React from 'react';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { DocumentTemplateEditor } from './document-template-editor';
import { DocumentTemplateListItem } from './document-template-list-item';
import {
  DocumentTemplatesView,
  useDocumentTemplatesSettings,
} from './use-document-templates-settings';

export const DocumentTemplatesContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    templates,
    isLoading,
    isError,
    refetch,
    view,
    editingUuid,
    handleCreate,
    handleEdit,
    handleBack,
  } = useDocumentTemplatesSettings();

  if (view !== DocumentTemplatesView.LIST) {
    return <DocumentTemplateEditor templateUuid={editingUuid} onBack={handleBack} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>
          {t(TEXT.DOCUMENT_TEMPLATES.LOADING)}
        </Typography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.ACCENT}>
          {t(TEXT.DOCUMENT_TEMPLATES.LOAD_ERROR)}
        </Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
          {t(TEXT.GENERAL.BUTTONS.RETRY)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {templates.length === 0 ? (
        <Typography variant={TypographyVariant.BODY} className="py-6 text-center text-ink-500">
          {t(TEXT.DOCUMENT_TEMPLATES.EMPTY)}
        </Typography>
      ) : (
        <ul className="flex flex-col gap-3">
          {templates.map((template) => (
            <DocumentTemplateListItem
              key={template.uuid}
              template={template}
              onEdit={() => handleEdit(template.uuid)}
            />
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleCreate}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-card border border-dashed border-ink-300 text-sm font-semibold text-ink-700 transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {t(TEXT.DOCUMENT_TEMPLATES.NEW)}
      </button>
    </div>
  );
};
