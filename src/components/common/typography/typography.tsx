import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

/**
 * Escala tipografica unica. Toda variante define su salto responsive
 * (mobile -> desktop) aqui, para que ninguna pantalla improvise tamanos.
 * Fuente: Manrope (la misma del sitio publico y del EDUS de la CCSS).
 */
export enum TypographyVariant {
  /** Titulo de pagina. */
  HEADER = 'HEADER',
  /** Titulo de seccion. */
  SUBTITLE = 'SUBTITLE',
  /** Encabezados de tabla y titulos de tarjeta. */
  ACCENT = 'ACCENT',
  /** Texto general y celdas. */
  BODY = 'BODY',
  BODY_SEMIBOLD = 'BODY_SEMIBOLD',
  BODY_BOLD = 'BODY_BOLD',
  /** Ayudas, etiquetas y metadatos. */
  HELPER = 'HELPER',
  /** Enlaces de accion dentro de texto. */
  LINK = 'LINK',
  /** Mensajes de error de validacion. */
  ERROR = 'ERROR',
}

const VARIANT_STYLES: Record<TypographyVariant, string> = {
  [TypographyVariant.HEADER]: 'font-bold text-xl md:text-2xl text-ink-900',
  [TypographyVariant.SUBTITLE]: 'font-semibold text-base md:text-lg text-ink-900',
  [TypographyVariant.ACCENT]: 'font-semibold text-sm md:text-base text-ink-800',
  [TypographyVariant.BODY]: 'font-normal text-sm md:text-base text-ink-700',
  [TypographyVariant.BODY_SEMIBOLD]: 'font-semibold text-sm md:text-base text-ink-800',
  [TypographyVariant.BODY_BOLD]: 'font-bold text-sm md:text-base text-ink-900',
  [TypographyVariant.HELPER]: 'font-normal text-xs md:text-sm text-ink-500',
  [TypographyVariant.LINK]: 'font-medium text-sm md:text-base text-brand-700 hover:underline',
  [TypographyVariant.ERROR]: 'font-normal text-xs md:text-sm text-danger',
};

const VARIANT_TAGS: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  [TypographyVariant.HEADER]: 'h1',
  [TypographyVariant.SUBTITLE]: 'h2',
  [TypographyVariant.ACCENT]: 'h3',
  [TypographyVariant.BODY]: 'p',
  [TypographyVariant.BODY_SEMIBOLD]: 'p',
  [TypographyVariant.BODY_BOLD]: 'p',
  [TypographyVariant.HELPER]: 'p',
  [TypographyVariant.LINK]: 'p',
  [TypographyVariant.ERROR]: 'span',
};

interface TypographyProps {
  variant?: TypographyVariant;
  className?: string;
  children: React.ReactNode;
  /** Cambia la etiqueta HTML sin cambiar el estilo. */
  as?: keyof JSX.IntrinsicElements;
  /** Fuerza <span> para texto dentro de una linea. */
  inline?: boolean;
  title?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = TypographyVariant.BODY,
  className,
  children,
  as,
  inline = false,
  title,
}) => {
  const Tag = as ?? (inline ? 'span' : VARIANT_TAGS[variant]);

  return React.createElement(
    Tag,
    { className: tailwind(VARIANT_STYLES[variant], className), title },
    children,
  );
};
