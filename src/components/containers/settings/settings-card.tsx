import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';

interface SettingsCardProps {
  /** Las listas llevan el relleno en cada fila: la tarjeta solo pone borde y recorta las esquinas. */
  hasPadding?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** La superficie única del contenido de Configuración. */
export const SettingsCard: React.FC<SettingsCardProps> = ({
  hasPadding = true,
  className,
  children,
}) => (
  <div
    className={tailwind(
      'w-full min-w-0 rounded-card border border-ink-200 bg-white',
      hasPadding ? 'p-4 sm:p-5' : 'overflow-hidden',
      className,
    )}
  >
    {children}
  </div>
);
