import React from 'react';
import { NotebookText } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { tailwind } from '@/utils/tailwind-utils';
import { DocumentCategory, DOCUMENT_CATEGORY_LABELS } from '@/types/documents/document.types';
import { PATIENT_NOTE_TEXT_MAX_LENGTH } from '@/types/patients/patient-note';

interface AddPatientNoteModalProps {
  isOpen: boolean;
  text: string;
  category: DocumentCategory;
  isCreating: boolean;
  canSubmit: boolean;
  onTextChange: (value: string) => void;
  onCategoryChange: (category: DocumentCategory) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AddPatientNoteModal: React.FC<AddPatientNoteModalProps> = ({
  isOpen,
  text,
  category,
  isCreating,
  canSubmit,
  onTextChange,
  onCategoryChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onCancel}
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-card bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
            <NotebookText className="h-5 w-5 text-brand-600" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <Typography variant={TypographyVariant.ACCENT}>Nueva nota de evolución</Typography>

            <div className="mt-3 flex flex-col gap-1">
              <label htmlFor="note-category">
                <Typography variant={TypographyVariant.HELPER}>Categoría</Typography>
              </label>
              <select
                id="note-category"
                value={category}
                onChange={(event) => onCategoryChange(event.target.value as DocumentCategory)}
                className={inputBaseClasses}
              >
                {Object.values(DocumentCategory).map((value) => (
                  <option key={value} value={value}>
                    {DOCUMENT_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-1">
              <label htmlFor="note-text">
                <Typography variant={TypographyVariant.HELPER}>Nota</Typography>
              </label>
              <textarea
                id="note-text"
                value={text}
                onChange={(event) => onTextChange(event.target.value)}
                placeholder="Describe la evolución del paciente..."
                rows={4}
                autoFocus
                className={tailwind(inputBaseClasses, 'resize-none')}
              />
              <Typography variant={TypographyVariant.HELPER} className="self-end">
                {text.trim().length}/{PATIENT_NOTE_TEXT_MAX_LENGTH}
              </Typography>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isCreating}>
            Cancelar
          </Button>
          <Button
            variant={ButtonVariant.PRIMARY}
            onClick={onConfirm}
            disabled={!canSubmit}
            isLoading={isCreating}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
