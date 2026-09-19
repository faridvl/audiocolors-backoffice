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
 * En PRODUCCION se usan DOS fotos reales de la clinica, una por formato —
 * bg-cover con una sola imagen muy vertical (ideal en el telefono) recorta
 * mal en el panel ancho de escritorio, y viceversa:
 * - Panel izquierdo (md+, mas ancho que alto): laboratorio.jpeg, cuyo
 *   contenido (manos + instrumental) esta repartido parejo, sin un punto
 *   focal unico que se pueda perder al recortar.
 * - Fondo mobile (retrato, igual de vertical que la foto): la nina con
 *   audifono, tal como aparece en el material de marketing de la clinica.
 * Ambas con el mismo tratamiento (blur leve + overlay navy). En DESARROLLO
 * se usa negro solido en su lugar, con la leyenda "Ambiente de pruebas" — asi
 * el fondo tambien distingue el ambiente de un vistazo, igual que favicons y
 * theme-color. No se usa ninguno de los 6 colores de las letras del logo
 * (p.ej. el morado de la S) porque esa letra perderia contraste contra un
 * fondo del mismo color.
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
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden">
      <BrandTopbar />

      <div className="flex min-h-0 flex-1">
        <div
          className={tailwind(
            'relative hidden w-1/2 shrink-0 items-center justify-center overflow-hidden bg-cover bg-center md:flex',
            isDev ? 'bg-dev-accent' : 'bg-midnight',
          )}
          style={isDev ? undefined : { backgroundImage: 'url(/login-bg-desktop.jpg)' }}
        >
          <div className="flex flex-col items-center px-10">
            <BrandLogo height={132} onDark priority />
            <Typography
              variant={TypographyVariant.HELPER}
              className="mt-2 uppercase tracking-[0.2em] text-ink-300"
            >
              Gestión Clínica
            </Typography>
            {isDev && (
              <Typography
                variant={TypographyVariant.HELPER}
                className="mt-1 uppercase tracking-[0.2em] text-ink-400"
              >
                Ambiente de pruebas
              </Typography>
            )}

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

          {isDev && (
            <Typography
              variant={TypographyVariant.HELPER}
              className="relative mt-3 text-center uppercase tracking-[0.2em] text-ink-300 md:hidden"
            >
              Ambiente de pruebas
            </Typography>
          )}

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
