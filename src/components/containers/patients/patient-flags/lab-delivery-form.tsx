import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { LAB_DELIVERY_NOTE_MAX_LENGTH } from '@/types/patients/patient-lab-shipment';
import { tailwind } from '@/utils/tailwind-utils';
import { LabDateField } from './lab-date-field';
import { useLabDeliveryForm } from './use-lab-delivery-form';

interface LabDeliveryFormProps {
  patient: Patient;
  onDelivered: () => void;
  onCancel: () => void;
}

/** Entrega de los audífonos del laboratorio: un día y una nota opcional. */
export const LabDeliveryForm: React.FC<LabDeliveryFormProps> = ({
  patient,
  onDelivered,
  onCancel,
}) => {
  const { t } = useTranslation();
  const {
    date,
    note,
    minDate,
    maxDate,
    errorMessage,
    isSaving,
    isSaveDisabled,
    handleDateChange,
    handleNoteChange,
    handleSave,
  } = useLabDeliveryForm({ patient, onDelivered });

  return (
    <div className="flex flex-col gap-3 pb-3">
      <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
        {t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DELIVERY.TITLE)}
      </Typography>
      <LabDateField
        id="lab-delivery-date"
        label={t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DELIVERY.DATE_LABEL)}
        value={date}
        min={minDate}
        max={maxDate}
        disabled={isSaving}
        onChange={handleDateChange}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="lab-delivery-note">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
            {t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DELIVERY.NOTE_LABEL)}
          </Typography>
        </label>
        <textarea
          id="lab-delivery-note"
          value={note}
          onChange={(event) => handleNoteChange(event.target.value)}
          maxLength={LAB_DELIVERY_NOTE_MAX_LENGTH}
          rows={3}
          disabled={isSaving}
          className={tailwind(inputBaseClasses, 'resize-none')}
        />
        <div className="flex items-start justify-between gap-2">
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DELIVERY.NOTE_HELP)}
          </Typography>
          <Typography variant={TypographyVariant.HELPER} className="shrink-0">
            {t(TEXT.GENERAL.CHARACTER_COUNT, {
              count: note.length,
              max: LAB_DELIVERY_NOTE_MAX_LENGTH,
            })}
          </Typography>
        </div>
      </div>
      <div aria-live="polite">
        {errorMessage && <Typography variant={TypographyVariant.ERROR}>{errorMessage}</Typography>}
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
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          disabled={isSaveDisabled}
          className="flex-1"
        >
          {t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DELIVERY.SAVE)}
        </Button>
      </div>
    </div>
  );
};
