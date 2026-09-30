import { useEffect } from 'react';

const ESCAPE_KEY = 'Escape';

/** Llama a `onEscape` al presionar Esc mientras el componente está montado (modales, fichas). */
export function useEscapeKey(onEscape: () => void, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ESCAPE_KEY) onEscape();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, isEnabled]);
}
