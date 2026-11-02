import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { TEXT } from '@/static/texts/i18n';
import { LabDateField } from './lab-date-field';

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
      <LabDateField
        id="lab-shipment-date"
        label={t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DATE_LABEL)}
        value={date}
        max={maxDate}
        onChange={onDateChange}
      />
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
