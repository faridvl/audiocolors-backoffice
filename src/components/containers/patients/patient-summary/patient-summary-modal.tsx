import React from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { MultiSelect } from '@/components/common/multi-select/multi-select';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { PatientSummaryPreview } from './patient-summary-preview';
import { SummaryOptionCard } from './summary-option-card';
import { SummaryCard, usePatientSummary } from './use-patient-summary';

interface PatientSummaryModalProps {
  patient: Patient;
  onClose: () => void;
}

const SUMMARY_TEXT = TEXT.PATIENTS.CLINICAL_SUMMARY;

const CARD_TITLES: Record<SummaryCard, string> = {
  [SummaryCard.TECHNICAL_SHEET]: SUMMARY_TEXT.SECTIONS.TECHNICAL_SHEET,
  [SummaryCard.TEMPLATES]: SUMMARY_TEXT.SECTIONS.TEMPLATES,
  [SummaryCard.BACKGROUND]: SUMMARY_TEXT.SECTIONS.BACKGROUND,
  [SummaryCard.OTOSCOPY]: SUMMARY_TEXT.SECTIONS.OTOSCOPY,
  [SummaryCard.AUDIOMETRY]: SUMMARY_TEXT.SECTIONS.AUDIOMETRY,
};

/** Elige qué lleva el resumen del paciente y abre su vista previa para corregirlo e imprimirlo. */
export const PatientSummaryModal: React.FC<PatientSummaryModalProps> = ({ patient, onClose }) => {
  const { t } = useTranslation();
  const summary = usePatientSummary(patient);

  // El modal sigue montado tras la vista previa: al volver, la selección está como se dejó.
  if (summary.preview) {
    return <PatientSummaryPreview preview={summary.preview} onClose={summary.closePreview} />;
  }

  return (
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
          {summary.cardStates.map((state) => (
            <SummaryOptionCard
              key={state.card}
              title={t(CARD_TITLES[state.card])}
              isChecked={state.isChecked}
              isAvailable={state.isAvailable}
              isLoading={state.isLoading}
              isError={state.isError}
              onRetry={state.onRetry}
              emptyText={
                state.card === SummaryCard.AUDIOMETRY ? t(SUMMARY_TEXT.AUDIOMETRY_EMPTY) : undefined
              }
              onChange={(isChecked) => summary.toggleCard(state.card, isChecked)}
            >
              {state.card === SummaryCard.TEMPLATES && (
                <div className="mt-3 border-t border-ink-100 pt-3">
                  <MultiSelect
                    options={summary.templates.map((template) => ({
                      value: template.uuid,
                      label: template.name,
                    }))}
                    selectedValues={summary.templateUuids}
                    onChange={summary.changeTemplates}
                    placeholder={t(SUMMARY_TEXT.TEMPLATES_PLACEHOLDER)}
                    searchPlaceholder={t(SUMMARY_TEXT.TEMPLATES_SEARCH)}
                    emptyText={t(SUMMARY_TEXT.TEMPLATES_NO_RESULTS)}
                    ariaLabel={t(SUMMARY_TEXT.SECTIONS.TEMPLATES)}
                    getSummaryLabel={(count) => t(SUMMARY_TEXT.TEMPLATES_SELECTED, { count })}
                    getRemoveLabel={(label) => t(SUMMARY_TEXT.TEMPLATES_REMOVE, { label })}
                  />
                </div>
              )}
              {state.card === SummaryCard.AUDIOMETRY && (
                <div className="mt-3 border-t border-ink-100 pt-3">
                  <MultiSelect
                    options={summary.audiometryOptions}
                    selectedValues={summary.audiometryUuids}
                    onChange={summary.changeAudiometries}
                    placeholder={t(SUMMARY_TEXT.AUDIOMETRY_PLACEHOLDER)}
                    searchPlaceholder={t(SUMMARY_TEXT.AUDIOMETRY_SEARCH)}
                    emptyText={t(SUMMARY_TEXT.AUDIOMETRY_NO_RESULTS)}
                    ariaLabel={t(SUMMARY_TEXT.SECTIONS.AUDIOMETRY)}
                    getSummaryLabel={(count) => t(SUMMARY_TEXT.AUDIOMETRY_SELECTED, { count })}
                    getRemoveLabel={(label) => t(SUMMARY_TEXT.AUDIOMETRY_REMOVE, { label })}
                  />
                </div>
              )}
            </SummaryOptionCard>
          ))}
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant={ButtonVariant.SECONDARY} onClick={onClose}>
            {t(SUMMARY_TEXT.CLOSE)}
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.PRIMARY}
            isLoading={summary.isLoadingChosen}
            disabled={!summary.canGenerate}
            onClick={summary.handleGenerate}
          >
            {t(SUMMARY_TEXT.GENERATE)}
          </Button>
        </div>
      </div>
    </div>
  );
};
