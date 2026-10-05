import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

/** Punto de color que identifica algo sin texto (el tipo de una cita). Sin color, gris. */
export const ColorDot: React.FC<{ color?: string; className?: string }> = ({
  color,
  className,
}) => (
  <span
    aria-hidden
    style={color ? { backgroundColor: color } : undefined}
    className={tailwind('h-2.5 w-2.5 shrink-0 rounded-full', !color && 'bg-ink-300', className)}
  />
);
