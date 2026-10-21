import React from 'react';
import { AlertTriangle, ClipboardList, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientBackgroundModal } from './patient-background-modal';
import { PatientBackgroundSummary } from './patient-background-summary';
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
    isHidden,
    isLoading,
    isError,
    refetch,
    summaryGroups,
    authorship,
    isEditing,
    handleStartEditing,
    handleCloseEditing,
  } = usePatientBackground(patientUuid);

  if (isHidden) return null;

  return (
    <section className="flex flex-col gap-3 rounded-card border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.PATIENTS.BACKGROUND.TITLE)}
        </Typography>
        {background && (
          <Button
            variant={ButtonVariant.GHOST}
            onClick={handleStartEditing}
            icon={<Pencil className="h-4 w-4" aria-hidden />}
          >
            {t(TEXT.PATIENTS.BACKGROUND.EDIT)}
          </Button>
        )}
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

      {!isLoading && !isError && !background && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-ink-300 px-4 py-6 text-center">
          <ClipboardList className="h-8 w-8 text-ink-300" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.PATIENTS.BACKGROUND.EMPTY)}
          </Typography>
          <Button variant={ButtonVariant.PRIMARY} onClick={handleStartEditing}>
            {t(TEXT.PATIENTS.BACKGROUND.FILL)}
          </Button>
        </div>
      )}

      {!isLoading && !isError && background && (
        <PatientBackgroundSummary
          background={background}
          groups={summaryGroups}
          authorship={authorship}
        />
      )}

      {isEditing && (
        <PatientBackgroundModal
          patientUuid={patientUuid}
          background={background}
          onClose={handleCloseEditing}
        />
      )}
    </section>
  );
};
