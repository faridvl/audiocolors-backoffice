import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface LabShipmentDateProps {
  /** "YYYY-MM-DD" elegido en el campo. */
  date: string;
  /** Último día que se puede elegir (hoy). */
  maxDate: string;
  isSaving: boolean;
  isSaveDisabled: boolean;
  onDateChange: (date: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** Fecha de envío de los audífonos al laboratorio, debajo del switch: un solo día. */
export const LabShipmentDate: React.FC<LabShipmentDateProps> = ({
  date,
  maxDate,
  isSaving,
  isSaveDisabled,
  onDateChange,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 pb-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lab-shipment-date">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
            {t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DATE_LABEL)}
          </Typography>
        </label>
        <input
          id="lab-shipment-date"
          type="date"
          max={maxDate}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          // Safari de iOS dibuja el input de fecha con su propio estilo; sin apariencia nativa
          // queda alineado con el resto de campos.
          className={tailwind(
            inputBaseClasses,
            'block h-[46px] min-w-0 appearance-none text-left',
            '[&::-webkit-date-and-time-value]:text-left',
          )}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={ButtonVariant.SECONDARY}
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1"
        >
          {t(TEXT.GENERAL.BUTTONS.CANCEL)}
        </Button>
        <Button onClick={onSave} isLoading={isSaving} disabled={isSaveDisabled} className="flex-1">
          {t(TEXT.GENERAL.BUTTONS.SAVE)}
        </Button>
      </div>
    </div>
  );
};
