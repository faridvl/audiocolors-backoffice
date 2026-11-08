import React from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Checkbox } from '@/components/common/checkbox/checkbox';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { PatientSummaryPrint } from './patient-summary-print';
import { SummaryOptionCard } from './summary-option-card';
import { SummaryCard, usePatientSummary } from './use-patient-summary';

interface PatientSummaryModalProps {
  patient: Patient;
  onClose: () => void;
}

const SUMMARY_TEXT = TEXT.PATIENTS.CLINICAL_SUMMARY;

const CARD_TITLES: Record<SummaryCard, string> = {
  [SummaryCard.TEMPLATES]: SUMMARY_TEXT.SECTIONS.TEMPLATES,
  [SummaryCard.BACKGROUND]: SUMMARY_TEXT.SECTIONS.BACKGROUND,
  [SummaryCard.OTOSCOPY]: SUMMARY_TEXT.SECTIONS.OTOSCOPY,
  [SummaryCard.AUDIOMETRY]: SUMMARY_TEXT.SECTIONS.AUDIOMETRY,
};

/** Elige qué lleva el resumen del paciente y lo manda a imprimir. */
export const PatientSummaryModal: React.FC<PatientSummaryModalProps> = ({ patient, onClose }) => {
  const { t } = useTranslation();
  const summary = usePatientSummary(patient);

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-full w-full max-w-md flex-col rounded-card bg-white p-5"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
              <FileText className="h-5 w-5 text-brand-700" aria-hidden />
            </span>
            <div className="min-w-0">
              <Typography variant={TypographyVariant.ACCENT}>{t(SUMMARY_TEXT.TITLE)}</Typography>
              <Typography variant={TypographyVariant.BODY} className="mt-1">
                {t(SUMMARY_TEXT.DESCRIPTION)}
              </Typography>
            </div>
          </div>

          <div className="mt-4 flex min-h-0 flex-col gap-2 overflow-y-auto">
            {summary.isLoadingLists && (
              <Typography variant={TypographyVariant.HELPER}>{t(SUMMARY_TEXT.LOADING)}</Typography>
            )}
            {summary.cardStates.map((state) => (
              <SummaryOptionCard
                key={state.card}
                title={t(CARD_TITLES[state.card])}
                isChecked={state.isChecked}
                isAvailable={state.isAvailable}
                isLoading={state.isLoading}
                onChange={(isChecked) => summary.toggleCard(state.card, isChecked)}
              >
                {state.card === SummaryCard.TEMPLATES && (
                  <div className="mt-2 flex flex-col gap-2 border-t border-ink-100 pt-2">
                    <Typography variant={TypographyVariant.HELPER}>
                      {t(SUMMARY_TEXT.TEMPLATES_HINT)}
                    </Typography>
                    {summary.templates.map((template) => (
                      <Checkbox
                        key={template.uuid}
                        label={template.name}
                        isChecked={summary.templateUuids.includes(template.uuid)}
                        onChange={(isChecked) => summary.toggleTemplate(template.uuid, isChecked)}
                        className="min-h-[32px]"
                      />
                    ))}
                  </div>
                )}
              </SummaryOptionCard>
            ))}
          </div>

          {summary.hasError && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <Typography variant={TypographyVariant.HELPER} className="text-danger">
                {t(SUMMARY_TEXT.LOAD_ERROR)}
              </Typography>
              <Button variant={ButtonVariant.SECONDARY} onClick={summary.retry}>
                {t(SUMMARY_TEXT.RETRY)}
              </Button>
            </div>
          )}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant={ButtonVariant.SECONDARY} onClick={onClose}>
              {t(SUMMARY_TEXT.CLOSE)}
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.PRIMARY}
              isLoading={summary.isLoadingChosen || summary.isGenerating}
              disabled={!summary.canGenerate}
              onClick={() => void summary.handleGenerate()}
            >
              {t(SUMMARY_TEXT.GENERATE)}
            </Button>
          </div>
        </div>
      </div>

      {summary.printProps && <PatientSummaryPrint {...summary.printProps} />}
    </>
  );
};
