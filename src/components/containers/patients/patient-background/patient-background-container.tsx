import React from 'react';
import { AlertTriangle, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionHeadingLevel,
  AccordionVariant,
} from '@/components/common/accordion/accordion';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { QuestionSectionControls } from '@/components/containers/questions/question-sections';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackgroundForm } from './patient-background-form';
import { PatientBackgroundSummary } from './patient-background-summary';
import { BackgroundFormMode } from './use-patient-background-form';
import { usePatientBackground } from './use-patient-background';

interface PatientBackgroundContainerProps extends QuestionSectionControls {
  patientUuid: string;
  onDirtyChange: (isDirty: boolean) => void;
}

export const PatientBackgroundContainer: React.FC<PatientBackgroundContainerProps> = ({
  patientUuid,
  isExpanded,
  onToggle,
  onExpand,
  onDirtyChange,
}) => {
  const { t } = useTranslation();
  const {
    background,
    summaryFields,
    formFields,
    answers,
    isHidden,
    isLoading,
    isError,
    refetch,
    authorship,
    isUpdating,
    isSaving,
    handleSavingChange,
    handleStartUpdate,
    handleCloseUpdate,
  } = usePatientBackground(patientUuid, onExpand);

  if (isHidden) return null;

  // Se llena una sola vez y queda fija; editarla después genera un PDF en Archivos.
  const isReady = !isLoading && !isError;
  const isFormVisible = isReady && (!background || isUpdating);

  return (
    <Accordion
      variant={AccordionVariant.NESTED}
      title={t(TEXT.PATIENTS.BACKGROUND.TITLE)}
      isExpanded={isExpanded}
      isToggleDisabled={isSaving}
      headingLevel={AccordionHeadingLevel.H3}
      onToggle={onToggle}
      scrollsIntoViewOnExpand
      action={
        isReady && background && !isUpdating ? (
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={handleStartUpdate}
            icon={<Pencil className="h-4 w-4 text-ink-500" aria-hidden />}
            className="shrink-0 whitespace-nowrap"
          >
            {t(TEXT.PATIENTS.BACKGROUND.UPDATE.BUTTON)}
          </Button>
        ) : undefined
      }
    >
      {isReady && !background && (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.BACKGROUND.EMPTY)}
        </Typography>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.PATIENTS.BACKGROUND.LOADING)}
          </Typography>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {t(TEXT.PATIENTS.BACKGROUND.LOAD_ERROR)}
          </Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}

      {isFormVisible && (
        <PatientBackgroundForm
          patientUuid={patientUuid}
          background={background}
          fields={formFields}
          mode={background ? BackgroundFormMode.UPDATE : BackgroundFormMode.FILL}
          onClose={handleCloseUpdate}
          onSavingChange={handleSavingChange}
          onDirtyChange={onDirtyChange}
        />
      )}

      {isReady && background && !isUpdating && (
        <PatientBackgroundSummary
          fields={summaryFields}
          answers={answers}
          authorship={authorship}
        />
      )}
    </Accordion>
  );
};
