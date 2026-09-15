import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';
import { BRAND_COLORS } from '@/shared/design/tokens';

/**
 * Franja de 6 colores que corona el sitio publico de AudioColors.
 * Es la firma visual de la marca: mismo orden y mismos colores que las letras
 * de "COLORS" en el logo (medidos del archivo original, no estimados).
 */
const STRIPE_COLORS = [
  BRAND_COLORS.red,
  BRAND_COLORS.orange,
  BRAND_COLORS.yellow,
  BRAND_COLORS.green,
  BRAND_COLORS.blue,
  BRAND_COLORS.purple,
];

interface RainbowStripeProps {
  className?: string;
}

export const RainbowStripe: React.FC<RainbowStripeProps> = ({ className }) => (
  <div aria-hidden className={tailwind('flex h-[5px] w-full shrink-0', className)}>
    {STRIPE_COLORS.map((color) => (
      <div key={color} className="flex-1" style={{ backgroundColor: color }} />
    ))}
  </div>
);
