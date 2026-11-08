import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface SummarySignatureProps {
  professionalName: string;
}

export const SummarySignature: React.FC<SummarySignatureProps> = ({ professionalName }) => (
  <footer className="mt-16 flex break-inside-avoid flex-col gap-1">
    <div className="w-80 max-w-full border-t border-ink-700" />
    <Typography variant={TypographyVariant.BODY_SEMIBOLD}>{professionalName}</Typography>
  </footer>
);
