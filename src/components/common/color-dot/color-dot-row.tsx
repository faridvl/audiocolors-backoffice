import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';
import { ColorDot } from './color-dot';

interface ColorDotRowProps {
  /** Un punto por color; `undefined` es un punto gris (algo sin color propio). */
  colors: (string | undefined)[];
  /** Sobre un fondo de color (un día elegido): cada punto lleva borde blanco para verse. */
  isOnColor?: boolean;
  className?: string;
}

/** Fila de puntos de color, p. ej. las sedes que tienen citas un día. */
export const ColorDotRow: React.FC<ColorDotRowProps> = ({
  colors,
  isOnColor = false,
  className,
}) => {
  if (colors.length === 0) return null;

  return (
    <span aria-hidden className={tailwind('flex flex-wrap items-center gap-1', className)}>
      {colors.map((color, index) => (
        <ColorDot
          key={`${color ?? 'none'}-${index}`}
          color={color}
          className={tailwind('h-2 w-2', isOnColor && 'ring-1 ring-white')}
        />
      ))}
    </span>
  );
};
