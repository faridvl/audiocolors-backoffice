import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

/**
 * Marca oficial de AudioColors, replicada del landing en produccion:
 * "audio" en gris + "COLORS" con degradado arcoiris (de ahi el nombre).
 * El tamano se controla con font-size en el contenedor (usa unidades em).
 */
interface BrandLogoProps {
  className?: string;
  onDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className, onDark = false }) => (
  <span className={tailwind('inline-flex select-none items-baseline gap-0', className)}>
    <span
      className={tailwind(
        'text-[0.9em] font-semibold tracking-tight',
        onDark ? 'text-white' : 'text-navy-900',
      )}
    >
      audio
    </span>
    <span
      className="bg-clip-text text-[1.35em] font-extrabold tracking-tighter text-transparent"
      style={{
        backgroundImage:
          'linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#a855f7)',
      }}
    >
      COLORS
    </span>
  </span>
);
