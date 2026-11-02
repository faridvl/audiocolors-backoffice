import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface PhysicalExamAnswerProps {
  label: string;
  value: string | null;
}

/** Lo explorado en un oído; sin registrar, en blanco. */
export const PhysicalExamAnswer: React.FC<PhysicalExamAnswerProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-ink-50 px-3 py-2">
      <Typography variant={TypographyVariant.HELPER}>{label}</Typography>
      <Typography
        variant={TypographyVariant.BODY}
        className={value ? 'whitespace-pre-wrap break-words text-ink-800' : 'text-ink-400'}
      >
        {value}
      </Typography>
    </div>
  );
};
