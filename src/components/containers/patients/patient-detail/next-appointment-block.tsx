import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/common/badge/badge';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDate, formatMonthLabel } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';

interface NextAppointmentBlockProps {
  patient: Patient;
  /** Sin él no se ofrece agendar: a un paciente fallecido el API se lo rechaza. */
  onSchedule?: () => void;
}

/** La próxima cita: confirmada, por confirmar (solo mes) o ninguna, con la acción para cambiarla. */
export const NextAppointmentBlock: React.FC<NextAppointmentBlockProps> = ({
  patient,
  onSchedule,
}) => {
  const { t } = useTranslation();

  let when: string | null = null;
  let type: string | null | undefined = null;
  if (patient.nextAppointmentAt) {
    when = formatDate(patient.nextAppointmentAt);
    type = patient.nextAppointmentType;
  } else if (patient.tentativeAppointmentMonth) {
    when = formatMonthLabel(patient.tentativeAppointmentMonth);
    type = patient.tentativeAppointmentTypeName;
  }

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Typography variant={TypographyVariant.HELPER}>
        {t(TEXT.PATIENTS.DETAIL.NEXT_APPOINTMENT)}
      </Typography>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Typography variant={TypographyVariant.BODY} inline className={!when ? 'text-ink-400' : ''}>
          {when ? [when, type].filter(Boolean).join(' · ') : t(TEXT.PATIENTS.DETAIL.NO_APPOINTMENT)}
        </Typography>
        {!patient.nextAppointmentAt && patient.tentativeAppointmentMonth && (
          <Badge className="bg-warning/15 font-medium text-ink-700">
            {t(TEXT.PATIENTS.DETAIL.PENDING_CONFIRMATION)}
          </Badge>
        )}
      </div>

      {onSchedule && (
        <button
          type="button"
          onClick={onSchedule}
          className="mt-0.5 w-fit text-sm font-medium text-brand-700 hover:underline"
        >
          {/* Con solo el mes, lo que sigue es fijar el día: agendar, no reagendar. */}
          {patient.nextAppointmentAt
            ? t(TEXT.PATIENTS.DETAIL.RESCHEDULE)
            : t(TEXT.PATIENTS.DETAIL.SCHEDULE)}
        </button>
      )}
    </div>
  );
};
