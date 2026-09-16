import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Manifest dinamico segun el host: dev-backoffice.audiocolors.com usa un
 * icono con fondo distinto al de backoffice.audiocolors.com (produccion),
 * para no confundir cual PWA se abrio en el home screen del iPhone.
 * Mismo patron que magastore-backoffice.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host ?? '';
  const isDev = host.includes('dev-backoffice') || host.includes('localhost') || host.includes('127.0.0.1');
  const iconSuffix = isDev ? '-dev' : '';
  /** Azul de la R (produccion) vs morado de la S (desarrollo) — BRAND.md. */
  const themeColor = isDev ? '#604290' : '#1e6cae';

  const manifest = {
    id: '/',
    name: isDev ? '[DEV] AudioColors · Expedientes' : 'AudioColors · Expedientes',
    short_name: isDev ? '[DEV] AudioColors' : 'AudioColors',
    description: 'Sistema de expedientes y archivos de pacientes de AudioColors.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    lang: 'es',
    icons: [
      { src: `/icon-192${iconSuffix}.png`, sizes: '192x192', type: 'image/png' },
      { src: `/icon-512${iconSuffix}.png`, sizes: '512x512', type: 'image/png' },
      {
        src: `/icon-512${iconSuffix}-maskable.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    theme_color: themeColor,
    background_color: '#ffffff',
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.status(200).json(manifest);
}
