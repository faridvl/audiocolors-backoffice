import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { SummaryEditableText } from './summary-editable-text';

const REPORT_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.REPORT;
const DOCUMENT_TEXT = TEXT.PATIENTS.CLINICAL_SUMMARY.DOCUMENT;

interface SummarySignatureProps {
  professionalName: string;
}

export const SummarySignature: React.FC<SummarySignatureProps> = ({ professionalName }) => {
  const { t } = useTranslation();

  return (
    <footer className="mt-4 flex break-before-avoid break-inside-avoid justify-end">
      <div className="flex w-72 shrink-0 flex-col items-center gap-0.5 text-center">
        <div className="mt-6 flex w-full flex-col items-center gap-0.5 border-t border-ink-500 pt-1">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
            <SummaryEditableText>{professionalName}</SummaryEditableText>
          </Typography>
          <p className="text-[10px] uppercase tracking-wide text-ink-500">
            {t(DOCUMENT_TEXT.SIGNATURE)}
          </p>
        </div>
        <p className="text-[10px] text-ink-500">
          {t(REPORT_TEXT.PRINTED_ON, { date: formatDate(new Date().toISOString()) })}
        </p>
      </div>
    </footer>
  );
};
