import React from 'react';
import { AlertTriangle, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientPhysicalExamForm } from './patient-physical-exam-form';
import { PhysicalExamAnswer } from './physical-exam-answer';
import { usePatientPhysicalExam } from './use-patient-physical-exam';

interface PatientPhysicalExamContainerProps {
  patientUuid: string;
}

/** Exploración física (otoscopia): siempre abierta, entre la ficha del paciente y la historia clínica. */
export const PatientPhysicalExamContainer: React.FC<PatientPhysicalExamContainerProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const {
    exam,
    isHidden,
    isLoading,
    isError,
    refetch,
    authorship,
    initialValues,
    isEditing,
    isPending,
    handleStartEdit,
    handleCancelEdit,
    handleSubmit,
  } = usePatientPhysicalExam(patientUuid);

  if (isHidden) return null;

  const isReady = !isLoading && !isError;
  const isEmpty = !exam?.otoscopyRight && !exam?.otoscopyLeft;

  return (
    <section className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Typography variant={TypographyVariant.SUBTITLE}>
          {t(TEXT.PATIENTS.BACKGROUND.OTOSCOPY_TITLE)}
        </Typography>
        {isReady && !isEditing && (
          <Button
            variant={ButtonVariant.SECONDARY}
            onClick={handleStartEdit}
            icon={<Pencil className="h-4 w-4 text-ink-500" aria-hidden />}
            className="w-full shrink-0 whitespace-nowrap sm:w-auto"
          >
            {t(isEmpty ? TEXT.PATIENTS.PHYSICAL_EXAM.REGISTER : TEXT.PATIENTS.PHYSICAL_EXAM.EDIT)}
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>
            {t(TEXT.PATIENTS.PHYSICAL_EXAM.LOADING)}
          </Typography>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.ACCENT}>
            {t(TEXT.PATIENTS.PHYSICAL_EXAM.LOAD_ERROR)}
          </Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={refetch} className="mt-2">
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}

      {isReady && isEditing && (
        <PatientPhysicalExamForm
          initialValues={initialValues}
          isPending={isPending}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
        />
      )}

      {isReady && !isEditing && isEmpty && (
        <Typography variant={TypographyVariant.BODY} className="text-ink-500">
          {t(TEXT.PATIENTS.PHYSICAL_EXAM.EMPTY)}
        </Typography>
      )}

      {isReady && !isEditing && !isEmpty && (
        <>
          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
            <PhysicalExamAnswer
              label={t(TEXT.PATIENTS.BACKGROUND.RIGHT_EAR)}
              value={exam?.otoscopyRight ?? null}
            />
            <PhysicalExamAnswer
              label={t(TEXT.PATIENTS.BACKGROUND.LEFT_EAR)}
              value={exam?.otoscopyLeft ?? null}
            />
          </div>
          {authorship && (
            <Typography variant={TypographyVariant.HELPER} className="border-t border-ink-100 pt-3">
              {authorship}
            </Typography>
          )}
        </>
      )}
    </section>
  );
};
