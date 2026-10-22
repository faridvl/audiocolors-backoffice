import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackgroundForm } from './patient-background-form';
import { PatientBackgroundSummary } from './patient-background-summary';
import { usePatientBackground } from './use-patient-background';

interface PatientBackgroundContainerProps {
  patientUuid: string;
}

export const PatientBackgroundContainer: React.FC<PatientBackgroundContainerProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const { background, isHidden, isLoading, isError, refetch, summaryGroups, authorship } =
    usePatientBackground(patientUuid);

  if (isHidden) return null;

  // Se llena una sola vez: sin historia se muestra la hoja; guardada, queda el resumen fijo.
  const isFormVisible = !isLoading && !isError && !background;

  return (
    <section className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Typography variant={TypographyVariant.SUBTITLE}>
            {t(TEXT.PATIENTS.BACKGROUND.TITLE)}
          </Typography>
          {isFormVisible && (
            <Typography variant={TypographyVariant.HELPER} className="mt-0.5">
              {t(TEXT.PATIENTS.BACKGROUND.EMPTY)}
            </Typography>
          )}
        </div>
      </div>

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

      {isFormVisible && <PatientBackgroundForm patientUuid={patientUuid} background={background} />}

      {!isLoading && !isError && background && (
        <PatientBackgroundSummary
          background={background}
          groups={summaryGroups}
          authorship={authorship}
        />
      )}
    </section>
  );
};
