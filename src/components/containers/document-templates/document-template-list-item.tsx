import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { DocumentTemplateSummary } from '@/types/document-templates/document-template';

interface DocumentTemplateListItemProps {
  template: DocumentTemplateSummary;
  onEdit: () => void;
}

export const DocumentTemplateListItem: React.FC<DocumentTemplateListItemProps> = ({
  template,
  onEdit,
}) => {
  const { t } = useTranslation();

  return (
    <li className="flex items-center justify-between gap-3 rounded-card border border-ink-200 bg-white p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="truncate">
          {template.name}
        </Typography>
        {template.description && (
          <Typography variant={TypographyVariant.HELPER} className="line-clamp-2">
            {template.description}
          </Typography>
        )}
      </div>
      <Button
        variant={ButtonVariant.SECONDARY}
        onClick={onEdit}
        aria-label={t(TEXT.DOCUMENT_TEMPLATES.EDIT_LABEL, { name: template.name })}
        className="shrink-0"
      >
        {t(TEXT.DOCUMENT_TEMPLATES.EDIT)}
      </Button>
    </li>
  );
};
