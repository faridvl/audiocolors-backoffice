import React from 'react';
import { AlertTriangle, ChevronDown, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionMenu } from '@/components/common/action-menu/action-menu';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackgroundForm } from './patient-background-form';
import { PatientBackgroundSummary } from './patient-background-summary';
import { BackgroundFormMode } from './use-patient-background-form';
import { usePatientBackground } from './use-patient-background';

interface PatientBackgroundContainerProps {
  patientUuid: string;
}

export const PatientBackgroundContainer: React.FC<PatientBackgroundContainerProps> = ({
  patientUuid,
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
    isExpanded,
    handleToggleExpanded,
    handleStartUpdate,
    handleCloseUpdate,
  } = usePatientBackground(patientUuid);

  if (isHidden) return null;

  // Se llena una sola vez y queda fija; editarla después genera un PDF en Archivos.
  const isReady = !isLoading && !isError;
  const isFormVisible = isExpanded && isReady && (!background || isUpdating);

  return (
    <section className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={handleToggleExpanded}
          aria-expanded={isExpanded}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
        >
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 text-ink-500 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
            aria-hidden
          />
          <div className="min-w-0">
            <Typography variant={TypographyVariant.SUBTITLE}>
              {t(TEXT.PATIENTS.BACKGROUND.TITLE)}
            </Typography>
            {isReady && !background && (
              <Typography variant={TypographyVariant.HELPER} className="mt-0.5">
                {t(TEXT.PATIENTS.BACKGROUND.EMPTY)}
              </Typography>
            )}
          </div>
        </button>
        {isReady && background && !isUpdating && (
          <ActionMenu
            ariaLabel={t(TEXT.PATIENTS.BACKGROUND.ACTIONS)}
            items={[
              {
                label: t(TEXT.PATIENTS.BACKGROUND.UPDATE.BUTTON),
                icon: <Pencil className="h-4 w-4" aria-hidden />,
                onClick: handleStartUpdate,
              },
            ]}
          />
        )}
      </div>

      {isExpanded && isLoading && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.PATIENTS.BACKGROUND.LOADING)}
          </Typography>
        </div>
      )}

      {isExpanded && isError && !isLoading && (
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
        />
      )}

      {isExpanded && isReady && background && !isUpdating && (
        <PatientBackgroundSummary
          fields={summaryFields}
          answers={answers}
          authorship={authorship}
        />
      )}
    </section>
  );
};
