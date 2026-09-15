import React, { useEffect } from 'react';
import { X, ExternalLink, FileQuestion } from 'lucide-react';
import { DocumentItem, DocumentKind } from '@/types/documents/document.types';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: item,
  onClose,
}) => {
  useEffect(() => {
    if (!item) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Evita que la pagina de atras haga scroll mientras el visor esta abierto.
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = previousOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${item.name}`}
      className="fixed inset-0 z-50 flex flex-col bg-navy-900/80 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-card bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-navy-200 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <Typography variant={TypographyVariant.CARD_TITLE} className="truncate">
              {item.name}
            </Typography>
            <Typography variant={TypographyVariant.CAPTION}>
              {item.categoryLabel} · {item.sizeLabel} · {item.uploadedAtLabel}
            </Typography>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir en pestana nueva"
              className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-700"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista previa"
              className="rounded-lg p-2 text-navy-500 transition-colors hover:bg-navy-100 hover:text-navy-700"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center overflow-auto bg-navy-100 p-3">
          {item.kind === DocumentKind.IMAGE && (
            // Archivo servido desde R2: se usa <img> para no configurar
            // remotePatterns de next/image por cada dominio de storage.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.name}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {item.kind === DocumentKind.PDF && (
            <iframe src={item.url} title={item.name} className="h-full w-full border-0 bg-white" />
          )}

          {item.kind === DocumentKind.OTHER && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <FileQuestion className="h-10 w-10 text-navy-400" aria-hidden />
              <Typography variant={TypographyVariant.BODY}>
                Este tipo de archivo no se puede previsualizar aqui.
              </Typography>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Abrir archivo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
