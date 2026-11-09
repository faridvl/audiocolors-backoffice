import { MouseEvent, useRef } from 'react';

/**
 * Props para el fondo oscuro de un modal: cierra solo si el clic empezó y terminó sobre el propio
 * fondo. Así un clic que arranca en un control y termina en el fondo (porque el panel cambió de
 * tamaño entre el mousedown y el mouseup) no cierra el modal.
 */
export function useBackdropClose(onClose: () => void) {
  const isPressOnBackdropRef = useRef(false);

  return {
    onMouseDown: (event: MouseEvent<HTMLElement>) => {
      isPressOnBackdropRef.current = event.target === event.currentTarget;
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      const isBackdropClick =
        isPressOnBackdropRef.current && event.target === event.currentTarget;
      isPressOnBackdropRef.current = false;
      if (isBackdropClick) onClose();
    },
  };
}
