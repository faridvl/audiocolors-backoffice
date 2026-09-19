import React from 'react';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { BrandTopbar } from '@/components/common/brand/brand-topbar';
import { RainbowStripe } from '@/components/common/brand/rainbow-stripe';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useIsDevEnvironment } from '@/hooks/use-is-dev-environment';
import { tailwind } from '@/utils/tailwind-utils';

/**
 * Layout de pantalla partida para paginas publicas (login).
 *
 * En PRODUCCION, tanto el panel izquierdo (md+) como el fondo mobile
 * muestran una foto real de laboratorio (v2/laboratorio.jpeg) con overlay
 * navy, como el mockup del manual de marca. En DESARROLLO se usa el color
 * solido morado — asi el fondo tambien distingue el ambiente de un vistazo,
 * igual que favicons y theme-color.
 *
 * En mobile el formulario vive en una card blanca elevada sobre ese fondo,
 * en vez de ocupar toda la pantalla en blanco liso: sin eso el login se veia
 * generico y con demasiado aire vacio arriba/abajo.
 */
interface SplitScreenLayoutProps {
  children: React.ReactNode;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({ children }) => {
  const isDev = useIsDevEnvironment();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <BrandTopbar />

      <div className="flex min-h-0 flex-1">
        <div
          className={tailwind(
            'relative hidden w-1/2 shrink-0 items-center justify-center overflow-hidden bg-cover bg-center md:flex',
            isDev ? 'bg-dev-accent' : 'bg-midnight',
          )}
          style={isDev ? undefined : { backgroundImage: 'url(/login-bg.jpg)' }}
        >
          <div className="flex flex-col items-center px-10">
            <BrandLogo height={132} onDark priority />

            <RainbowStripe className="mt-8 w-24 overflow-hidden rounded-full" />

            <Typography
              variant={TypographyVariant.BODY}
              className="mt-8 max-w-sm text-center text-ink-300"
            >
              Gestión clínica, recetas y audiometrías de tus pacientes, en un solo lugar.
            </Typography>
          </div>
        </div>

        <div className="relative flex w-full flex-col overflow-y-auto overscroll-y-contain md:w-1/2">
          <div
            className={tailwind(
              'pointer-events-none absolute inset-0 bg-cover bg-center md:hidden',
              isDev && 'bg-dev-accent',
            )}
            style={!isDev ? { backgroundImage: 'url(/login-bg.jpg)' } : undefined}
          />

          <div
            className="relative flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8"
            style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl shadow-black/10 md:rounded-none md:bg-transparent md:p-0 md:shadow-none">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
