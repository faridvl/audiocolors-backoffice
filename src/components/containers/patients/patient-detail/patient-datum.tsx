import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

interface PatientDatumProps {
  label: string;
  value?: string | null;
  /** Contenido propio en vez del texto (p. ej. insignias); si va, `value` se ignora. */
  children?: React.ReactNode;
  className?: string;
}

/** Dato del expediente con su etiqueta encima; vacío no muestra nada. */
export const PatientDatum: React.FC<PatientDatumProps> = ({ label, value, children, className }) => {
  // Un arreglo vacío es truthy: sin esto dejaría un `dd` sin contenido.
  const hasChildren = React.Children.toArray(children).length > 0;

  return (
    <div className={tailwind('flex min-w-0 flex-col gap-0.5', className)}>
      <Typography variant={TypographyVariant.HELPER} as="dt">
        {label}
      </Typography>
      {hasChildren ? (
        <dd className="flex flex-wrap gap-1">{children}</dd>
      ) : (
        <Typography
          variant={TypographyVariant.BODY}
          as="dd"
          className={tailwind(value ? 'break-words' : 'whitespace-nowrap text-ink-400')}
        >
          {value}
        </Typography>
      )}
    </div>
  );
};
