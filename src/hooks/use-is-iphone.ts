import { useEffect, useState } from 'react';

const IPHONE_USER_AGENT = /iPhone|iPod/;

/**
 * Si la app corre en un iPhone. Se calcula después de montar: en el servidor
 * no hay `navigator`, y decidirlo en el primer render rompería la hidratación.
 */
export function useIsIphone(): boolean {
  const [isIphone, setIsIphone] = useState(false);

  useEffect(() => {
    setIsIphone(IPHONE_USER_AGENT.test(navigator.userAgent));
  }, []);

  return isIphone;
}
