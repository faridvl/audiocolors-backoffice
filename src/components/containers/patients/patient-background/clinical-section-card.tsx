import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface ClinicalSectionCardProps {
  title: string | null;
  children: React.ReactNode;
}

export const ClinicalSectionCard: React.FC<ClinicalSectionCardProps> = ({ title, children }) => (
  <section className="flex flex-col rounded-lg border border-ink-200 px-3 pb-1 pt-2.5">
    {title && (
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="mb-1 text-ink-600">
        {title}
      </Typography>
    )}
    {children}
  </section>
);
