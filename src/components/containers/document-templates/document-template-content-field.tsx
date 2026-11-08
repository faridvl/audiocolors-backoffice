import React from 'react';
import {
  Bold,
  Heading,
  Italic,
  List,
  ListOrdered,
  type LucideIcon,
  Strikethrough,
} from 'lucide-react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TextFormat } from '@/shared/utils/document-template-text';
import { TEXT } from '@/static/texts/i18n';
import { DOCUMENT_TEMPLATE_CONTENT_MAX_LENGTH } from '@/types/document-templates/document-template';
import { tailwind } from '@/utils/tailwind-utils';

const CONTENT_ID = 'content';

const TOOLBAR_ACTIONS: { format: TextFormat; icon: LucideIcon; labelKey: string }[] = [
  { format: TextFormat.BOLD, icon: Bold, labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.BOLD },
  { format: TextFormat.ITALIC, icon: Italic, labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.ITALIC },
  {
    format: TextFormat.STRIKE,
    icon: Strikethrough,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.STRIKE,
  },
  { format: TextFormat.HEADING, icon: Heading, labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.HEADING },
  {
    format: TextFormat.BULLET_LIST,
    icon: List,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.BULLET_LIST,
  },
  {
    format: TextFormat.NUMBERED_LIST,
    icon: ListOrdered,
    labelKey: TEXT.DOCUMENT_TEMPLATES.TOOLBAR.NUMBERED_LIST,
  },
];

interface DocumentTemplateContentFieldProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onFormat: (format: TextFormat) => void;
  onViewExample: () => void;
}

/** El mensaje: barra de formato arriba y un área de texto grande; "Ver ejemplo" arriba a la derecha. */
export const DocumentTemplateContentField: React.FC<DocumentTemplateContentFieldProps> = ({
  textareaRef,
  onFormat,
  onViewExample,
}) => {
  const { t } = useTranslation();
  const [field, { error, touched }] = useField<string>('content');
  const errorText = touched && error ? error : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={CONTENT_ID}>
          <Typography variant={TypographyVariant.BODY} inline>
            {t(TEXT.DOCUMENT_TEMPLATES.CONTENT)}
            <span className="ml-0.5 text-danger">*</span>
          </Typography>
        </label>
        <button
          type="button"
          onClick={onViewExample}
          className="rounded-md px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Typography variant={TypographyVariant.LINK} inline>
            {t(TEXT.DOCUMENT_TEMPLATES.VIEW_EXAMPLE)}
          </Typography>
        </button>
      </div>

      <div
        role="toolbar"
        aria-label={t(TEXT.DOCUMENT_TEMPLATES.TOOLBAR.LABEL)}
        className="flex flex-wrap gap-1"
      >
        {TOOLBAR_ACTIONS.map(({ format, icon: Icon, labelKey }) => (
          <button
            key={format}
            type="button"
            title={t(labelKey)}
            aria-label={t(labelKey)}
            onClick={() => onFormat(format)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        ))}
      </div>

      <textarea
        {...field}
        id={CONTENT_ID}
        ref={textareaRef}
        maxLength={DOCUMENT_TEMPLATE_CONTENT_MAX_LENGTH}
        placeholder={t(TEXT.DOCUMENT_TEMPLATES.CONTENT_PLACEHOLDER)}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={errorText ? `${CONTENT_ID}-error` : undefined}
        className={tailwind(inputBaseClasses, 'min-h-[240px] resize-y sm:min-h-[340px]')}
      />

      {errorText && (
        <Typography variant={TypographyVariant.ERROR} id={`${CONTENT_ID}-error`}>
          {errorText}
        </Typography>
      )}
    </div>
  );
};
