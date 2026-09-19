import React, { useEffect } from 'react';
import { X, ExternalLink, FileQuestion } from 'lucide-react';
import { DocumentItem, DocumentKind } from '@/types/documents/document.types';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { tailwind } from '@/utils/tailwind-utils';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: item,
  onClose,
}) => {
  const resolveAuthorLabel = useResolveAuthorLabel();

  useEffect(() => {
    if (!item) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Evita que la página de atras haga scroll mientras el visor esta abierto.
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
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-ink-900/80 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-card bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <Typography variant={TypographyVariant.ACCENT} className="truncate">
              {item.name}
            </Typography>
            <Typography variant={TypographyVariant.HELPER} className="truncate">
              {item.categoryLabel} · {item.sizeLabel} · {resolveAuthorLabel(item.uploadedByUuid)}
            </Typography>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir en pestaña nueva"
              className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar vista previa"
              className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <div
          className={tailwind(
            'flex flex-1 items-center justify-center overflow-auto',
            item.kind === DocumentKind.PDF ? 'bg-white' : 'bg-ink-100 p-3',
          )}
        >
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
            <>
              {/*
                El visor de PDF nativo de iOS Safari ignora el ancho del
                iframe y renderiza la pagina a su tamano real, cortandola.
                En desktop (Chrome/Edge/Firefox) el iframe ajusta bien, asi
                que ahi se mantiene; en mobile se ofrece abrir el archivo,
                donde el navegador lo muestra a pantalla completa sin cortes.
              */}
              <iframe
                src={item.url}
                title={item.name}
                className="hidden h-full w-full border-0 bg-white md:block"
              />
              <div className="flex flex-col items-center gap-3 p-8 text-center md:hidden">
                <FileQuestion className="h-10 w-10 text-ink-400" aria-hidden />
                <Typography variant={TypographyVariant.BODY}>
                  Abre el archivo para verlo a pantalla completa.
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
            </>
          )}

          {item.kind === DocumentKind.OTHER && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <FileQuestion className="h-10 w-10 text-ink-400" aria-hidden />
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
