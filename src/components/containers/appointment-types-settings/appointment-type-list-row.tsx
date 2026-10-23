import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/common/badge/badge';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { AppointmentType } from '@/types/appointments/appointment-type';

interface AppointmentTypeListRowProps {
  appointmentType: AppointmentType;
  onEdit: () => void;
}

/** Un tipo de cita tal como queda: se edita en su ventana, no en la lista. */
export const AppointmentTypeListRow: React.FC<AppointmentTypeListRowProps> = ({
  appointmentType,
  onEdit,
}) => {
  const { t } = useTranslation();

  return (
    <li>
      <Button
        variant={ButtonVariant.CARD}
        onClick={onEdit}
        aria-label={t(TEXT.SETTINGS.APPOINTMENT_TYPES.EDIT_LABEL, { name: appointmentType.name })}
        className="min-h-[60px] rounded-none border-0 border-b border-ink-100 px-4"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} inline className="truncate">
            {appointmentType.name}
          </Typography>
          {appointmentType.isControl && (
            <Badge>{t(TEXT.SETTINGS.APPOINTMENT_TYPES.CONTROL_BADGE)}</Badge>
          )}
        </span>
        <Typography variant={TypographyVariant.BODY} inline className="shrink-0 text-ink-500">
          {appointmentType.duration
            ? t(TEXT.SETTINGS.APPOINTMENT_TYPES.MINUTES_SHORT, { count: appointmentType.duration })
            : t(TEXT.GENERAL.NOT_REGISTERED)}
        </Typography>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      </Button>
    </li>
  );
};
