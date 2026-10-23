import React, { useEffect } from 'react';
import { X, ExternalLink, FileQuestion, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DocumentItem, DocumentKind } from '@/types/documents/document.types';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { buttonClasses, ButtonVariant } from '@/components/common/button/button';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';

const QUARTER_TURN_DEGREES = 90;
const HALF_TURN_DEGREES = 180;

const HEADER_ACTION_CLASSES =
  'flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  rotationDegrees: number;
  onRotate: () => void;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: item,
  rotationDegrees,
  onRotate,
  onClose,
}) => {
  const { t } = useTranslation();
  const resolveAuthorLabel = useResolveAuthorLabel();

  useEffect(() => {
    if (!item) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // En captura y sin propagar: si el visor se abrió sobre otro modal, Escape cierra solo el visor.
      event.stopPropagation();
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    // Evita que la página de atras haga scroll mientras el visor esta abierto.
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.document.body.style.overflow = previousOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;

  // De costado la imagen ocupa el alto del visor como ancho y viceversa: la
  // caja que la contiene se dimensiona ya intercambiada y después se gira.
  const isSideways = rotationDegrees % HALF_TURN_DEGREES === QUARTER_TURN_DEGREES;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.DOCUMENTS.PREVIEW.LABEL, { name: item.displayName })}
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-ink-900/80 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-card bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-ink-200 px-4 py-2">
          <div className="flex min-w-0 flex-col">
            <Typography variant={TypographyVariant.ACCENT} className="truncate">
              {item.displayName}
            </Typography>
            <Typography variant={TypographyVariant.HELPER} className="truncate">
              {item.categoryLabel} · {item.sizeLabel} · {t(TEXT.DOCUMENTS.LIST.REGISTERED_BY)}{' '}
              <span className="italic">
                {resolveAuthorLabel(item.uploadedByUuid, item.uploadedByName)}
              </span>
            </Typography>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {item.kind === DocumentKind.IMAGE && (
              <button
                type="button"
                onClick={onRotate}
                aria-label={t(TEXT.DOCUMENTS.PREVIEW.ROTATE)}
                title={t(TEXT.DOCUMENTS.PREVIEW.ROTATE)}
                className={HEADER_ACTION_CLASSES}
              >
                <RotateCw className="h-5 w-5" aria-hidden />
              </button>
            )}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t(TEXT.DOCUMENTS.PREVIEW.OPEN_NEW_TAB)}
              title={t(TEXT.DOCUMENTS.PREVIEW.OPEN_NEW_TAB)}
              className={HEADER_ACTION_CLASSES}
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label={t(TEXT.DOCUMENTS.PREVIEW.CLOSE)}
              className={HEADER_ACTION_CLASSES}
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
            // `container-type: size` habilita las unidades cqw/cqh, que dan el
            // tamaño del visor para dimensionar la caja girada sin medir con JS.
            <div className="relative h-full w-full overflow-hidden [container-type:size]">
              <div
                className={tailwind(
                  'absolute left-1/2 top-1/2 flex items-center justify-center',
                  isSideways ? 'h-[100cqw] w-[100cqh]' : 'h-full w-full',
                )}
                style={{ transform: `translate(-50%, -50%) rotate(${rotationDegrees}deg)` }}
              >
                {/* Archivo servido desde R2: se usa <img> para no configurar
                    remotePatterns de next/image por cada dominio de storage. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.displayName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
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
                title={item.displayName}
                className="hidden h-full w-full border-0 bg-white md:block"
              />
              <div className="flex flex-col items-center gap-3 p-8 text-center md:hidden">
                <FileQuestion className="h-10 w-10 text-ink-400" aria-hidden />
                <Typography variant={TypographyVariant.BODY}>
                  {t(TEXT.DOCUMENTS.PREVIEW.PDF_MOBILE_HINT)}
                </Typography>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses(ButtonVariant.PRIMARY)}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  {t(TEXT.DOCUMENTS.PREVIEW.OPEN_FILE)}
                </a>
              </div>
            </>
          )}

          {item.kind === DocumentKind.OTHER && (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <FileQuestion className="h-10 w-10 text-ink-400" aria-hidden />
              <Typography variant={TypographyVariant.BODY}>
                {t(TEXT.DOCUMENTS.PREVIEW.UNSUPPORTED)}
              </Typography>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses(ButtonVariant.PRIMARY)}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                {t(TEXT.DOCUMENTS.PREVIEW.OPEN_FILE)}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
