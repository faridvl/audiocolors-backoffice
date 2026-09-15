import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

export enum TypographyVariant {
  PAGE_TITLE = 'PAGE_TITLE',
  SECTION_TITLE = 'SECTION_TITLE',
  CARD_TITLE = 'CARD_TITLE',
  BODY = 'BODY',
  BODY_STRONG = 'BODY_STRONG',
  CAPTION = 'CAPTION',
  LABEL = 'LABEL',
  ERROR = 'ERROR',
}

const VARIANT_STYLES: Record<TypographyVariant, string> = {
  [TypographyVariant.PAGE_TITLE]: 'text-2xl font-bold text-navy-900',
  [TypographyVariant.SECTION_TITLE]: 'text-lg font-semibold text-navy-900',
  [TypographyVariant.CARD_TITLE]: 'text-base font-semibold text-navy-800',
  [TypographyVariant.BODY]: 'text-sm text-navy-600',
  [TypographyVariant.BODY_STRONG]: 'text-sm font-medium text-navy-800',
  [TypographyVariant.CAPTION]: 'text-xs text-navy-500',
  [TypographyVariant.LABEL]: 'text-sm font-medium text-navy-700',
  [TypographyVariant.ERROR]: 'text-xs text-danger',
};

const VARIANT_TAGS: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  [TypographyVariant.PAGE_TITLE]: 'h1',
  [TypographyVariant.SECTION_TITLE]: 'h2',
  [TypographyVariant.CARD_TITLE]: 'h3',
  [TypographyVariant.BODY]: 'p',
  [TypographyVariant.BODY_STRONG]: 'p',
  [TypographyVariant.CAPTION]: 'span',
  [TypographyVariant.LABEL]: 'span',
  [TypographyVariant.ERROR]: 'span',
};

interface TypographyProps {
  variant?: TypographyVariant;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  title?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = TypographyVariant.BODY,
  className,
  children,
  as,
  title,
}) => {
  const Tag = as ?? VARIANT_TAGS[variant];
  return React.createElement(
    Tag,
    { className: tailwind(VARIANT_STYLES[variant], className), title },
    children,
  );
};
