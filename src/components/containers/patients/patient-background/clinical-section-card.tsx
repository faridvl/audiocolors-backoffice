import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

interface ClinicalSectionCardProps {
  title: string | null;
  /** Sin borde cuando ya va dentro de otra caja (el formulario de un registro). */
  isBordered?: boolean;
  children: React.ReactNode;
}

export const ClinicalSectionCard: React.FC<ClinicalSectionCardProps> = ({
  title,
  isBordered = true,
  children,
}) => (
  <section
    className={tailwind(
      'flex flex-col rounded-lg pb-1 pt-2.5',
      isBordered ? 'border border-ink-200 px-3' : 'px-1',
    )}
  >
    {title && (
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="mb-1 text-ink-600">
        {title}
      </Typography>
    )}
    {children}
  </section>
);
