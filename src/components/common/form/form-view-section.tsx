import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

/**
 * Seccion de formulario o de detalle. Misma pieza para ambos casos, para que
 * "ver" y "editar" un registro compartan estructura y no se desalineen.
 *
 * En desktop es una tarjeta; en movil va plana, sin borde, para no encajonar
 * el contenido en pantallas angostas.
 */
interface FormViewSectionProps {
  title: string;
  caption?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const FormViewSection: React.FC<FormViewSectionProps> = ({
  title,
  caption,
  action,
  className,
  children,
}) => (
  <section
    className={tailwind(
      'flex flex-col md:rounded-card md:border md:border-ink-200 md:bg-white md:p-5',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Typography variant={TypographyVariant.SUBTITLE}>{title}</Typography>
        {caption && (
          <Typography variant={TypographyVariant.HELPER} className="mt-1">
            {caption}
          </Typography>
        )}
      </div>
      {action}
    </div>

    <div className="mt-5">{children}</div>
  </section>
);

/**
 * Par etiqueta/valor de solo lectura. Muestra un guion cuando no hay dato:
 * un campo vacio sin marca se confunde con un error de carga.
 */
interface FormViewLabelProps {
  label: string;
  value?: string | null;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const FormViewLabel: React.FC<FormViewLabelProps> = ({
  label,
  value,
  icon: Icon,
  className,
}) => (
  <div className={tailwind('flex items-start gap-2.5', className)}>
    {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />}
    <div className="flex min-w-0 flex-col gap-0.5">
      <Typography variant={TypographyVariant.HELPER}>{label}</Typography>
      {value ? (
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="break-words">
          {value}
        </Typography>
      ) : (
        <Typography variant={TypographyVariant.BODY} className="text-ink-400">
          Sin registrar
        </Typography>
      )}
    </div>
  </div>
);
