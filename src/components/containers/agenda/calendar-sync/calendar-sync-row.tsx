import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Copy } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ButtonLink } from '@/components/common/button/button-link';
import { ColorDot } from '@/components/common/color-dot/color-dot';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { CalendarSyncRowData } from './use-calendar-sync';

interface CalendarSyncRowProps {
  row: CalendarSyncRowData;
  onCopy: (url: string) => void;
}

/** Una sede: su color, "Agregar" (abre la suscripción en el teléfono) y copiar el enlace. */
export const CalendarSyncRow: React.FC<CalendarSyncRowProps> = ({ row, onCopy }) => {
  const { t } = useTranslation();

  return (
    <li className="flex items-center gap-3 py-2">
      <ColorDot color={row.color} className="h-3 w-3" />
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="min-w-0 flex-1 truncate">
        {row.label}
      </Typography>
      <Button
        variant={ButtonVariant.GHOST}
        onClick={() => onCopy(row.url)}
        aria-label={`${t(TEXT.AGENDA.CALENDAR_SYNC.COPY)} · ${row.label}`}
        icon={<Copy className="h-4 w-4" aria-hidden />}
        className="h-10 min-h-0 w-10 shrink-0 px-0"
      />
      <ButtonLink
        href={row.url}
        variant={ButtonVariant.SECONDARY}
        icon={<CalendarPlus className="h-4 w-4" aria-hidden />}
        className="min-h-[40px] shrink-0 px-3"
      >
        {t(TEXT.AGENDA.CALENDAR_SYNC.ADD)}
      </ButtonLink>
    </li>
  );
};
