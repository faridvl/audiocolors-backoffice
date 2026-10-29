import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

export enum AccordionVariant {
  /** Tarjeta propia, como las demás del expediente. */
  CARD = 'CARD',
  /** Dentro de otra tarjeta: fondo sutil, sin segundo borde. */
  NESTED = 'NESTED',
  /** Sin borde ni relleno: para contenido que ya trae sus propias tarjetas. */
  PLAIN = 'PLAIN',
}

export enum AccordionHeadingLevel {
  H2 = 'h2',
  H3 = 'h3',
}

export enum AccordionSubtitleTone {
  DEFAULT = 'DEFAULT',
  /** Algo pendiente que no se debe perder de vista (p. ej. un borrador sin guardar). */
  WARNING = 'WARNING',
}

const TITLE_STYLES: Record<AccordionVariant, string> = {
  [AccordionVariant.CARD]: '',
  [AccordionVariant.NESTED]: 'text-base font-medium',
  [AccordionVariant.PLAIN]: '',
};

const VARIANT_STYLES: Record<AccordionVariant, string> = {
  [AccordionVariant.CARD]: 'rounded-card border border-ink-200 bg-white p-4 sm:p-5',
  [AccordionVariant.NESTED]: 'rounded-lg bg-ink-50 p-2 sm:p-4',
  [AccordionVariant.PLAIN]: '',
};

interface AccordionProps {
  title: string;
  subtitle?: string;
  subtitleTone?: AccordionSubtitleTone;
  isExpanded: boolean;
  onToggle: () => void;
  variant?: AccordionVariant;
  headingLevel?: AccordionHeadingLevel;
  isToggleDisabled?: boolean;
  /** Monta el contenido la primera vez que se abre y lo deja montado después. */
  isLazy?: boolean;
  /** Al abrirlo, lleva la cabecera a la vista (abrir uno cierra otro y la página se mueve). */
  scrollsIntoViewOnExpand?: boolean;
  /** Acción a la derecha de la cabecera (menú, botón); queda fuera del botón que abre y cierra. */
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Sin `isLazy`, el contenido sigue montado cuando está cerrado (solo oculto): así conserva su
 * estado y sus datos al volver a abrirlo.
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  subtitle,
  subtitleTone = AccordionSubtitleTone.DEFAULT,
  isExpanded,
  onToggle,
  variant = AccordionVariant.CARD,
  headingLevel = AccordionHeadingLevel.H2,
  isToggleDisabled = false,
  isLazy = false,
  scrollsIntoViewOnExpand = false,
  action,
  className,
  children,
}) => {
  const baseId = useId();
  const buttonId = `${baseId}-button`;
  const regionId = `${baseId}-region`;
  const [hasBeenExpanded, setHasBeenExpanded] = useState(isExpanded);
  if (isExpanded && !hasBeenExpanded) setHasBeenExpanded(true);
  const Heading = headingLevel;
  const sectionRef = useRef<HTMLElement>(null);
  const wasExpanded = useRef(isExpanded);

  useEffect(() => {
    if (scrollsIntoViewOnExpand && isExpanded && !wasExpanded.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      sectionRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
    wasExpanded.current = isExpanded;
  }, [isExpanded, scrollsIntoViewOnExpand]);

  return (
    <section
      ref={sectionRef}
      className={tailwind('flex flex-col gap-4', VARIANT_STYLES[variant], className)}
    >
      <div className="flex items-start justify-between gap-3">
        <Heading className="min-w-0 flex-1">
          <button
            id={buttonId}
            type="button"
            onClick={onToggle}
            disabled={isToggleDisabled}
            aria-expanded={isExpanded}
            aria-controls={regionId}
            className="flex min-h-[44px] w-full min-w-0 items-center gap-2 rounded text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed"
          >
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-ink-600 transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
              aria-hidden
            />
            <span className="block min-w-0">
              <Typography
                variant={TypographyVariant.SUBTITLE}
                as="span"
                className={tailwind('block', TITLE_STYLES[variant])}
              >
                {title}
              </Typography>
              {subtitle && subtitleTone === AccordionSubtitleTone.WARNING && (
                <Typography
                  variant={TypographyVariant.HELPER}
                  as="span"
                  className="mt-0.5 inline-flex items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-ink-700"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
                  {subtitle}
                </Typography>
              )}
              {subtitle && subtitleTone === AccordionSubtitleTone.DEFAULT && (
                <Typography variant={TypographyVariant.HELPER} as="span" className="mt-0.5 block">
                  {subtitle}
                </Typography>
              )}
            </span>
          </button>
        </Heading>
        {action}
      </div>

      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        className={isExpanded ? 'flex flex-col gap-4' : 'hidden'}
      >
        {(!isLazy || hasBeenExpanded) && children}
      </div>
    </section>
  );
};
