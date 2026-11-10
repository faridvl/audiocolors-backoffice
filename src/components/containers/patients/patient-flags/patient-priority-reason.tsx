import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';

/** "Motivo… · Nombre, fecha" bajo la prioridad del expediente; sin nombre, solo la fecha. */
export const PatientPriorityReason: React.FC<{
  patient: Patient;
  className?: string;
}> = ({ patient, className }) => {
  const { t } = useTranslation();
  const { priorityReason, priorityByName, prioritySince } = patient;
  if (!prioritySince || !priorityReason) return null;

  const date = formatDate(prioritySince);
  const text = priorityByName
    ? t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_LINE_AUTHOR, {
        reason: priorityReason,
        author: priorityByName,
        date,
      })
    : t(TEXT.PATIENTS.FLAGS.PRIORITY.REASON_LINE_DATE, {
        reason: priorityReason,
        date,
      });

  return (
    <Typography variant={TypographyVariant.HELPER} className={className}>
      <span className="whitespace-pre-wrap break-words">{text}</span>
    </Typography>
  );
};
