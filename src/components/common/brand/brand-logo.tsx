import React from 'react';
import Image from 'next/image';
import { tailwind } from '@/utils/tailwind-utils';

/**
 * Logo oficial de AudioColors, extraido de los VECTORES del manual de marca
 * (AUDIOCOLORS LOGO Y VARIANTES.ai) — no de un JPEG reescalado.
 *
 * Dos variantes reales del archivo, no filtros CSS: sobre fondo claro "audio"
 * va en gris; sobre fondo oscuro va en blanco. Las letras de color no cambian.
 *
 * Solo se pasa la ALTURA: el ancho lo fija la proporcion nativa 2.49:1, para
 * que el logo no se deforme ni se recorte.
 */
export const LOGO_ASPECT_RATIO = 2.49;

interface BrandLogoProps {
  /** Altura en pixeles. El ancho se calcula solo. */
  height?: number;
  className?: string;
  /** true cuando va sobre un fondo oscuro. */
  onDark?: boolean;
  priority?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  height = 40,
  className,
  onDark = false,
  priority = false,
}) => {
  const width = Math.round(height * LOGO_ASPECT_RATIO);

  return (
    <Image
      src={onDark ? '/logo-audiocolors-dark.png' : '/logo-audiocolors.png'}
      alt="AudioColors"
      width={width}
      height={height}
      priority={priority}
      className={tailwind('h-auto w-auto object-contain', className)}
      style={{ height, width }}
    />
  );
};
