import { useEffect, useState } from 'react';

/**
 * Mismo criterio que _document.tsx y site.webmanifest.ts, pero evaluado en
 * cliente: dev-backoffice, localhost o 127.0.0.1 son entorno de pruebas.
 * Empieza en `false` (asume produccion) hasta montar, para no diferir del
 * render de servidor.
 */
export function useIsDevEnvironment() {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setIsDev(host.includes('dev-backoffice') || host.includes('localhost') || host === '127.0.0.1');
  }, []);

  return isDev;
}
