import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';

interface PhysicalExamAnswerProps {
  label: string;
  value: string | null;
}

/** Lo explorado en un oído; sin registrar, en gris. */
export const PhysicalExamAnswer: React.FC<PhysicalExamAnswerProps> = ({ label, value }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-ink-50 px-3 py-2">
      <Typography variant={TypographyVariant.HELPER}>{label}</Typography>
      <Typography
        variant={TypographyVariant.BODY}
        className={value ? 'whitespace-pre-wrap break-words text-ink-800' : 'text-ink-400'}
      >
        {value || t(TEXT.GENERAL.NOT_REGISTERED)}
      </Typography>
    </div>
  );
};
