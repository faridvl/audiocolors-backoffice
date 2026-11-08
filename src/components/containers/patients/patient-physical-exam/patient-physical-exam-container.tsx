import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { PatientPhysicalExamForm } from './patient-physical-exam-form';

interface PatientPhysicalExamContainerProps {
  patientUuid: string;
}

/** Exploración física (otoscopia): siempre lista para una otoscopia nueva; el historial vive en Control de evolución. */
export const PatientPhysicalExamContainer: React.FC<PatientPhysicalExamContainerProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-4 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
      <Typography variant={TypographyVariant.SUBTITLE}>
        {t(TEXT.PATIENTS.BACKGROUND.OTOSCOPY_TITLE)}
      </Typography>
      <PatientPhysicalExamForm patientUuid={patientUuid} />
    </section>
  );
};
