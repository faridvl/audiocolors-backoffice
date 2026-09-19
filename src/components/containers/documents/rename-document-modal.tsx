import React from 'react';
import { Pencil } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { tailwind } from '@/utils/tailwind-utils';
import { DOCUMENT_NAME_MAX_LENGTH } from '@/types/documents/document.types';

interface RenameDocumentModalProps {
  isOpen: boolean;
  value: string;
  isRenaming: boolean;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RenameDocumentModal: React.FC<RenameDocumentModalProps> = ({
  isOpen,
  value,
  isRenaming,
  onChange,
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
        className="w-full max-w-sm rounded-card bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
            <Pencil className="h-5 w-5 text-brand-600" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <Typography variant={TypographyVariant.ACCENT}>Renombrar archivo</Typography>
            <div className="mt-3 flex flex-col gap-1">
              <label htmlFor="document-rename-input">
                <Typography variant={TypographyVariant.HELPER}>Nombre</Typography>
              </label>
              <input
                id="document-rename-input"
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoFocus
                maxLength={DOCUMENT_NAME_MAX_LENGTH}
                className={tailwind(inputBaseClasses)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onConfirm();
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} disabled={isRenaming}>
            Cancelar
          </Button>
          <Button variant={ButtonVariant.PRIMARY} onClick={onConfirm} isLoading={isRenaming}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
