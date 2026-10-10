import { useEffect, useState } from 'react';

/**
 * Valores que sobreviven mientras la app está abierta. En memoria y no en
 * sessionStorage: al navegar entre pantallas basta, y leer storage en el
 * primer render rompería la hidratación de Next. Al recargar se reinician.
 */
const rememberedValues = new Map<string, unknown>();

/** `useState` que recuerda su valor al salir de la pantalla y volver. */
export function useRememberedState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() =>
    rememberedValues.has(key) ? (rememberedValues.get(key) as T) : initialValue,
  );

  useEffect(() => {
    rememberedValues.set(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
