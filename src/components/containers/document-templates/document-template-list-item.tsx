import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatLongDate } from '@/shared/utils/formatters';
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
    <li>
      <button
        type="button"
        onClick={onEdit}
        aria-label={t(TEXT.DOCUMENT_TEMPLATES.EDIT_LABEL, { name: template.name })}
        className="flex min-h-[60px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="block truncate" inline>
            {template.name}
          </Typography>
          <Typography variant={TypographyVariant.HELPER} className="block" inline>
            {t(TEXT.DOCUMENT_TEMPLATES.UPDATED_AT, {
              date: formatLongDate(template.updatedAt),
            })}
          </Typography>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      </button>
    </li>
  );
};
