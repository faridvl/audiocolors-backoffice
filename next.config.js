const { version } = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Un segundo `next dev` contra el API local (docs/AMBIENTE-LOCAL.md) necesita su propia carpeta.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // La versión publicada (la sube `yarn release:bump`): se muestra en el menú del usuario.
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

module.exports = nextConfig;
