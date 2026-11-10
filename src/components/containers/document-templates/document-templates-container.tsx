import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { SettingsAddButton } from '../settings/settings-add-button';
import { SettingsCard } from '../settings/settings-card';
import { SettingsSectionError, SettingsSectionLoading } from '../settings/settings-section-state';
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

  return (
    <div className="flex w-full flex-col gap-4">
      <SettingsAddButton
        label={t(TEXT.DOCUMENT_TEMPLATES.NEW)}
        onClick={handleCreate}
        disabled={isLoading || isError}
      />

      {isLoading ? (
        <SettingsCard>
          <SettingsSectionLoading message={t(TEXT.DOCUMENT_TEMPLATES.LOADING)} />
        </SettingsCard>
      ) : isError ? (
        <SettingsCard>
          <SettingsSectionError
            message={t(TEXT.DOCUMENT_TEMPLATES.LOAD_ERROR)}
            onRetry={() => refetch()}
          />
        </SettingsCard>
      ) : templates.length === 0 ? (
        <Typography variant={TypographyVariant.BODY} className="max-w-md py-2 text-ink-500">
          {t(TEXT.DOCUMENT_TEMPLATES.EMPTY)}
        </Typography>
      ) : (
        <SettingsCard hasPadding={false}>
          <ul className="divide-y divide-ink-100">
            {templates.map((template) => (
              <DocumentTemplateListItem
                key={template.uuid}
                template={template}
                onEdit={() => handleEdit(template.uuid)}
              />
            ))}
          </ul>
        </SettingsCard>
      )}
    </div>
  );
};
