import React from 'react';
import { useTranslation } from 'react-i18next';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { useWarrantyDocument } from './use-warranty-document';

/** Selector del archivo de la garantía: guarda al elegir, como los switches del modal. */
export const WarrantyDocumentSelect: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { t } = useTranslation();
  const { options, selectedValue, hasDocuments, isLoading, handleChange } =
    useWarrantyDocument(patient);
  const label = t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.LABEL);

  return (
    <div className="flex flex-col gap-1.5">
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
        {label}
      </Typography>
      {isLoading ? (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.LOADING)}
        </Typography>
      ) : hasDocuments ? (
        <PillSelect
          variant={PillSelectVariant.FIELD}
          value={selectedValue}
          options={options}
          onChange={handleChange}
          ariaLabel={label}
        />
      ) : (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.EMPTY)}
        </Typography>
      )}
    </div>
  );
};
