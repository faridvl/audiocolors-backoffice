import { useEffect, useState } from 'react';

/** Breakpoint `lg` (924px) de Tailwind. Empieza en `false` hasta montar, igual que `useIsMobile`. */
const DESKTOP_QUERY = '(min-width: 924px)';

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
