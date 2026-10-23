const { version } = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // La versión publicada (la sube `yarn release:bump`): se muestra en el menú del usuario.
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
};

module.exports = nextConfig;
