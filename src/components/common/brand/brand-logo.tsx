import React from 'react';
import Image from 'next/image';
import { tailwind } from '@/utils/tailwind-utils';

/**
 * Logo oficial de AudioColors: "audio" + "COLORS" con una letra de cada color
 * y la C dibujada como oreja. Relacion 2.47:1.
 *
 * Dos variantes reales del archivo, no filtros CSS: sobre fondo claro "audio"
 * va en gris; sobre fondo oscuro va en blanco. Las letras de color son
 * identicas en ambas.
 */
interface BrandLogoProps {
  className?: string;
  /** true cuando va sobre un fondo oscuro. */
  onDark?: boolean;
  priority?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  onDark = false,
  priority = false,
}) => (
  <span className={tailwind('relative block h-10 w-[99px]', className)}>
    <Image
      src={onDark ? '/logo-audiocolors-dark.png' : '/logo-audiocolors.png'}
      alt="AudioColors"
      fill
      priority={priority}
      sizes="(max-width: 768px) 140px, 400px"
      className="object-contain object-left"
    />
  </span>
);
