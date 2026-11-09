import React from 'react';
import { FIELD_LABEL_CLASSES } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

/** Para esconder la etiqueta propia del campo: la fila ya muestra la suya. */
export const SETTINGS_FIELD_LABEL_HIDDEN = 'sr-only';

/** Anchos máximos del campo según su dato. */
export enum SettingsFieldWidth {
  SHORT = 'max-w-xs',
  MEDIUM = 'max-w-md',
  LONG = 'max-w-xl',
  FULL = 'max-w-full',
}

interface SettingsFieldRowProps {
  label: string;
  hint?: string;
  /** Marca la etiqueta de la fila con el asterisco de obligatorio. */
  isRequired?: boolean;
  /** Control junto a la etiqueta (p. ej. un botón de ayuda). */
  labelAddon?: React.ReactNode;
  width?: SettingsFieldWidth;
  children: React.ReactNode;
}

/**
 * Fila de un formulario de Configuración: etiqueta y ayuda a la izquierda y el campo a la derecha
 * desde `lg`; apilados en el celular. El campo ocupa el ancho de su dato, no el de la tarjeta.
 */
export const SettingsFieldRow: React.FC<SettingsFieldRowProps> = ({
  label,
  hint,
  isRequired = false,
  labelAddon,
  width = SettingsFieldWidth.MEDIUM,
  children,
}) => (
  <div className="grid gap-2 border-b border-ink-100 py-4 first:pt-0 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-8">
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center">
        <Typography variant={TypographyVariant.BODY} className={FIELD_LABEL_CLASSES} as="span">
          <span aria-hidden>
            {label}
            {isRequired && <span className="ml-0.5 text-danger">*</span>}
          </span>
        </Typography>
        {labelAddon}
      </div>
      {hint && <Typography variant={TypographyVariant.HELPER}>{hint}</Typography>}
    </div>
    <div className={tailwind('w-full min-w-0', width)}>{children}</div>
  </div>
);
