import type { NextApiRequest, NextApiResponse } from 'next';

/** Manifest dinámico según el host: dev usa ícono y colores distintos de producción. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host ?? '';
  const isDev = host.includes('dev-backoffice') || host.includes('localhost') || host.includes('127.0.0.1');
  const iconSuffix = isDev ? '-dev' : '';
  const themeColor = isDev ? '#0a0a0a' : '#1f6fb1';

  const manifest = {
    id: '/',
    name: isDev ? '[DEV] AudioColors · Gestión Clínica' : 'AudioColors · Gestión Clínica',
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
    background_color: isDev ? '#0a0a0a' : '#ffffff',
  };

  res.setHeader('Content-Type', 'application/manifest+json');
  res.status(200).json(manifest);
}
