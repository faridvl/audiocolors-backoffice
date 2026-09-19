import { useEffect, useState } from 'react';

/**
 * Mismo breakpoint `sm` (640px) que ya usa Tailwind en toda la app para
 * separar la tarjeta de movil del grid/tabla de escritorio. Empieza en
 * `false` (asume escritorio) hasta montar, para no diferir del render de
 * servidor.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}
