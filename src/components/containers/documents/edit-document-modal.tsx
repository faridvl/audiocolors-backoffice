import React from 'react';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';
import {
  DocumentCategory,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_NAME_MAX_LENGTH,
} from '@/types/documents/document.types';
import { TEXT } from '@/static/texts/i18n';

const CATEGORY_OPTIONS = Object.values(DocumentCategory).map((category) => ({
  value: category,
  label: DOCUMENT_CATEGORY_LABELS[category],
}));

interface EditDocumentModalProps {
  isOpen: boolean;
  name: string;
  category: DocumentCategory;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  name,
  category,
  isSaving,
  onNameChange,
  onCategoryChange,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.DOCUMENTS.EDIT.TITLE)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onCancel}
    >
      <form
        className="w-full max-w-sm rounded-card bg-white p-5"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
            <Pencil className="h-5 w-5 text-brand-600" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.DOCUMENTS.EDIT.TITLE)}
            </Typography>

            <div className="flex flex-col gap-1">
              <label htmlFor="document-edit-name">
                <Typography variant={TypographyVariant.HELPER}>
                  {t(TEXT.DOCUMENTS.FIELDS.NAME)}
                </Typography>
              </label>
              <input
                id="document-edit-name"
                type="text"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                autoFocus
                maxLength={DOCUMENT_NAME_MAX_LENGTH}
                className={inputBaseClasses}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Typography variant={TypographyVariant.HELPER} as="span">
                {t(TEXT.DOCUMENTS.FIELDS.CATEGORY)}
              </Typography>
              <PillSelect
                variant={PillSelectVariant.FIELD}
                ariaLabel={t(TEXT.DOCUMENTS.FIELDS.CATEGORY)}
                value={category}
                onChange={onCategoryChange}
                options={CATEGORY_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isSaving}>
            {t(TEXT.GENERAL.BUTTONS.CANCEL)}
          </Button>
          <Button type="submit" variant={ButtonVariant.PRIMARY} isLoading={isSaving}>
            {t(TEXT.GENERAL.BUTTONS.SAVE)}
          </Button>
        </div>
      </form>
    </div>
  );
};
