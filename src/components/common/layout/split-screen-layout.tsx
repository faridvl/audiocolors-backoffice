import React from 'react';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { BrandTopbar } from '@/components/common/brand/brand-topbar';
import { RainbowStripe } from '@/components/common/brand/rainbow-stripe';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

/**
 * Layout de pantalla partida para paginas publicas (login).
 *
 * El panel izquierdo muestra el LOGO en si, no una foto: las fotos del rotulo
 * de la clínica estan comprimidas a ~0.03 bytes/pixel y se ven blandas al
 * ampliarlas a pantalla completa. Asi es nitido en cualquier resolucion.
 */
interface SplitScreenLayoutProps {
  children: React.ReactNode;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({ children }) => (
  <div className="flex h-screen w-screen flex-col overflow-hidden">
    <BrandTopbar />

    <div className="flex min-h-0 flex-1">
      <div className="relative hidden w-1/2 shrink-0 items-center justify-center overflow-hidden border-r border-ink-200 bg-ink-50 md:flex">
        <div className="flex flex-col items-center px-10">
          <BrandLogo height={132} priority />

          <RainbowStripe className="mt-8 w-24 overflow-hidden rounded-full" />

          <Typography
            variant={TypographyVariant.BODY}
            className="mt-8 max-w-sm text-center text-ink-500"
          >
            Expedientes, recetas y audiometrías de tus pacientes, en un solo lugar.
          </Typography>
        </div>
      </div>

      <div className="flex w-full flex-col overflow-y-auto md:w-1/2">
        <div className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8">
          {children}
        </div>
      </div>
    </div>
  </div>
);
