import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hand } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { getFullName } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';

interface SelectionBannerProps {
  patient: Patient;
  /** Si la ventana de horarios está cerrada, se pide primero tocar un día. */
  isDayPanelOpen: boolean;
  onViewDetails: () => void;
  onCancel: () => void;
}

/** Aviso del "tocar y tocar": a quién se va a agendar y qué falta tocar. */
export const SelectionBanner: React.FC<SelectionBannerProps> = ({
  patient,
  isDayPanelOpen,
  onViewDetails,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-3 rounded-lg border border-brand/40 bg-brand-50 p-3">
      <Hand className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden />
      <div className="min-w-0 flex-1">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="text-brand-700">
          {t(TEXT.AGENDA.BOARD.SELECTION.TITLE, {
            name: getFullName(patient.firstName, patient.lastName),
          })}
        </Typography>
        {!isDayPanelOpen && (
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.AGENDA.BOARD.SELECTION.OPEN_DAY_HINT)}
          </Typography>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant={ButtonVariant.GHOST} onClick={onViewDetails} className="min-h-[36px] px-2">
          {t(TEXT.AGENDA.BOARD.SELECTION.VIEW_DETAILS)}
        </Button>
        <Button variant={ButtonVariant.SECONDARY} onClick={onCancel} className="min-h-[36px] px-3">
          {t(TEXT.GENERAL.BUTTONS.CANCEL)}
        </Button>
      </div>
    </div>
  );
};
