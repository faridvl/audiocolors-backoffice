import React, { CSSProperties } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientSummaryPrint } from './patient-summary-print';
import { SummaryEditableContext } from './summary-editable-text';
import { SummaryPreview } from './use-patient-summary';
import { usePatientSummaryPreview } from './use-patient-summary-preview';

const PREVIEW_TEXT = TEXT.PATIENTS.CLINICAL_SUMMARY.PREVIEW;

interface PatientSummaryPreviewProps {
  preview: SummaryPreview;
  onClose: () => void;
}

/** Pantalla completa con el resumen en hojas A4: se corrige el texto y recién entonces se imprime. */
export const PatientSummaryPreview: React.FC<PatientSummaryPreviewProps> = ({
  preview,
  onClose,
}) => {
  const { t } = useTranslation();
  const state = usePatientSummaryPreview({ fileName: preview.fileName, onClose });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(PREVIEW_TEXT.TITLE)}
      className="fixed inset-0 z-50 flex flex-col bg-ink-200"
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-ink-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <Typography variant={TypographyVariant.ACCENT}>{t(PREVIEW_TEXT.TITLE)}</Typography>
          <Typography variant={TypographyVariant.HELPER}>{t(PREVIEW_TEXT.HELP)}</Typography>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            icon={<ArrowLeft className="h-4 w-4" aria-hidden />}
            onClick={state.requestClose}
          >
            {t(PREVIEW_TEXT.BACK)}
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.PRIMARY}
            icon={<Printer className="h-4 w-4" aria-hidden />}
            isLoading={state.isPreparingPrint}
            onClick={() => void state.print()}
          >
            {t(PREVIEW_TEXT.PRINT)}
          </Button>
        </div>
      </div>

      <div ref={state.scrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-4">
        <div
          className="flex justify-center [zoom:var(--summary-zoom)] print:[zoom:1]"
          style={{ '--summary-zoom': state.zoom } as CSSProperties}
          onInput={state.markEdited}
        >
          <SummaryEditableContext.Provider value>
            <PatientSummaryPrint {...preview.printProps} />
          </SummaryEditableContext.Provider>
        </div>
      </div>

      {state.isConfirmingLeave && (
        <ConfirmDialog
          title={t(PREVIEW_TEXT.DISCARD_TITLE)}
          message={t(PREVIEW_TEXT.DISCARD_MESSAGE)}
          confirmLabel={t(PREVIEW_TEXT.DISCARD_CONFIRM)}
          cancelLabel={t(PREVIEW_TEXT.DISCARD_CANCEL)}
          onConfirm={onClose}
          onCancel={state.keepEditing}
        />
      )}
    </div>
  );
};
