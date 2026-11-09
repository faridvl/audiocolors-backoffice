import React, { useEffect, useState } from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

interface ClinicBrandProps {
  /** Logo de la clínica; sin él se muestra el nombre en texto. */
  logoUrl?: string | null;
  name?: string | null;
  /** Altura del logo en pixeles; el ancho sigue su proporción. */
  height?: number;
  className?: string;
  /** Estilo del nombre cuando no hay logo. */
  nameVariant?: TypographyVariant;
}

/**
 * Marca de la clínica del negocio actual (no la de AudioColors). Sin logo, o si
 * el archivo no carga, muestra el nombre: nunca cae al logo de AudioColors.
 * El logo va siempre en <img>: un SVG subido por el usuario no se inyecta inline.
 */
export const ClinicBrand: React.FC<ClinicBrandProps> = ({
  logoUrl,
  name,
  height = 40,
  className,
  nameVariant = TypographyVariant.BODY_BOLD,
}) => {
  const [hasLogoFailed, setHasLogoFailed] = useState(false);

  useEffect(() => {
    setHasLogoFailed(false);
  }, [logoUrl]);

  if (logoUrl && !hasLogoFailed) {
    return (
      // El logo vive en un host remoto que next/image no tiene configurado.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name ?? ''}
        onError={() => setHasLogoFailed(true)}
        className={tailwind('w-auto object-contain', className)}
        style={{ height, maxWidth: '100%' }}
      />
    );
  }

  if (!name) return null;

  return (
    <Typography variant={nameVariant} className={tailwind('truncate', className)} title={name}>
      {name}
    </Typography>
  );
};
