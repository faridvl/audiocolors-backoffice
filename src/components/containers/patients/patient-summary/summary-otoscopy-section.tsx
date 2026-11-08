import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { EMPTY_VALUE } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { SummaryOtoscopy } from './patient-summary-types';
import { buildAuthorship } from './summary-authorship';
import { SummarySectionTitle } from './summary-section-title';

const BACKGROUND_TEXT = TEXT.PATIENTS.BACKGROUND;

interface SummaryOtoscopySectionProps {
  entry: SummaryOtoscopy;
}

export const SummaryOtoscopySection: React.FC<SummaryOtoscopySectionProps> = ({ entry }) => {
  const { t } = useTranslation();
  const ears = [
    { key: 'right', label: t(BACKGROUND_TEXT.RIGHT_EAR), text: entry.otoscopyRight },
    { key: 'left', label: t(BACKGROUND_TEXT.LEFT_EAR), text: entry.otoscopyLeft },
  ];

  return (
    <section data-print-summary-section="" className="flex flex-col gap-3">
      <SummarySectionTitle
        title={t(TEXT.PATIENTS.CLINICAL_SUMMARY.SECTIONS.OTOSCOPY)}
        authorship={buildAuthorship(t, entry.createdByName, entry.createdAt)}
      />
      {ears.map((ear) => (
        <div key={ear.key} className="break-inside-avoid">
          <Typography variant={TypographyVariant.ACCENT}>{ear.label}</Typography>
          <p className="whitespace-pre-line text-sm text-ink-800">
            {ear.text?.trim() || EMPTY_VALUE}
          </p>
        </div>
      ))}
    </section>
  );
};
