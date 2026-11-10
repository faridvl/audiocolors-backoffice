import React, { CSSProperties } from 'react';
import { AlertTriangle, Loader2, Printer, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useBackdropClose } from '@/hooks/use-backdrop-close';
import { TEXT } from '@/static/texts/i18n';
import { AudiometryPrintReport } from '../patients/patient-audiometry/audiometry-print-report';
import { useAudiometryPreview } from './use-audiometry-preview';

const HEADER_ACTION_CLASSES =
  'flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700';

// La hoja marca el informe como lo único a imprimir: así el informe del contenedor de
// audiometría de la misma página no sale en una segunda hoja.
const SHEET_CLASSES =
  'flex w-[210mm] min-h-[297mm] shrink-0 flex-col bg-white p-[12mm] shadow-md print:min-h-0 print:w-auto print:p-0 print:shadow-none';

interface AudiometryPreviewModalProps {
  patientUuid: string;
  entryUuid: string;
  onClose: () => void;
}

export const AudiometryPreviewModal: React.FC<AudiometryPreviewModalProps> = ({
  patientUuid,
  entryUuid,
  onClose,
}) => {
  const { t } = useTranslation();
  const backdropClose = useBackdropClose(onClose);
  const state = useAudiometryPreview({ patientUuid, entryUuid, onClose });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.DOCUMENTS.AUDIOMETRY.MODAL_LABEL)}
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-ink-900/80 p-0 sm:p-6"
      {...backdropClose}
    >
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden bg-ink-200 sm:rounded-card">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-2">
          <Typography variant={TypographyVariant.ACCENT} className="min-w-0 truncate">
            {t(TEXT.DOCUMENTS.AUDIOMETRY.MODAL_LABEL)}
          </Typography>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant={ButtonVariant.PRIMARY}
              icon={<Printer className="h-4 w-4" aria-hidden />}
              isLoading={state.isPreparingPrint || state.isSignatureLoading}
              disabled={!state.report}
              onClick={() => void state.print()}
            >
              {t(TEXT.PATIENTS.DETAIL.AUDIOMETRY.PRINT)}
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t(TEXT.DOCUMENTS.PREVIEW.CLOSE)}
              className={HEADER_ACTION_CLASSES}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div ref={state.scrollRef} className="min-h-0 flex-1 overflow-auto py-4">
          {state.isLoading && (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
            </div>
          )}

          {state.isError && !state.isLoading && (
            <div className="flex flex-col items-center gap-2 py-14 text-center">
              <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
              <Typography variant={TypographyVariant.ACCENT}>
                {t(TEXT.DOCUMENTS.AUDIOMETRY.LOAD_ERROR)}
              </Typography>
              <Button variant={ButtonVariant.SECONDARY} onClick={state.refetch} className="mt-2">
                {t(TEXT.GENERAL.BUTTONS.RETRY)}
              </Button>
            </div>
          )}

          {state.report && (
            <div
              className="flex w-max min-w-full justify-center [zoom:var(--summary-zoom)] print:w-auto print:min-w-0 print:[zoom:1]"
              style={{ '--summary-zoom': state.zoom } as CSSProperties}
            >
              <div data-print-summary="" className={SHEET_CLASSES}>
                <AudiometryPrintReport
                  {...state.report}
                  signatureName={state.signatureName}
                  invalidation={state.invalidation}
                  isVisibleOnScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
