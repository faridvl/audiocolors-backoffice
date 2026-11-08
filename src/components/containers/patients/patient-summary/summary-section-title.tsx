import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface SummarySectionTitleProps {
  title: string;
  /** Autor y fecha del registro. */
  authorship?: string;
}

export const SummarySectionTitle: React.FC<SummarySectionTitleProps> = ({ title, authorship }) => (
  <header className="flex flex-col gap-0.5 border-b border-ink-300 pb-1">
    <Typography variant={TypographyVariant.SUBTITLE}>{title}</Typography>
    {authorship && <Typography variant={TypographyVariant.HELPER}>{authorship}</Typography>}
  </header>
);
