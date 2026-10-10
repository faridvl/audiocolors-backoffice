import React, { useRef, useState } from 'react';
import { tailwind } from '@/utils/tailwind-utils';

interface DropZoneProps {
  /** Si lo que se arrastra le sirve a esta zona (se decide por el tipo, no por el contenido). */
  accepts: (event: React.DragEvent) => boolean;
  onDrop: (event: React.DragEvent) => void;
  isDisabled?: boolean;
  className?: string;
  /** Clases extra mientras algo aceptable está encima. */
  activeClassName?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

/**
 * Zona que recibe un arrastre nativo (HTML5 drag and drop) y se resalta
 * mientras algo aceptable está encima. Cuenta entradas y salidas en vez de
 * usar un booleano: al pasar sobre un hijo el navegador dispara `dragleave`
 * en el padre y el resaltado parpadearía.
 */
export const DropZone: React.FC<DropZoneProps> = ({
  accepts,
  onDrop,
  isDisabled = false,
  className,
  activeClassName = 'bg-brand-50 ring-2 ring-inset ring-brand',
  ariaLabel,
  children,
}) => {
  const [isOver, setIsOver] = useState(false);
  const depth = useRef(0);

  const isAccepted = (event: React.DragEvent) => !isDisabled && accepts(event);

  const reset = () => {
    depth.current = 0;
    setIsOver(false);
  };

  return (
    <div
      aria-label={ariaLabel}
      onDragEnter={(event) => {
        if (!isAccepted(event)) return;
        event.preventDefault();
        depth.current += 1;
        setIsOver(true);
      }}
      onDragOver={(event) => {
        if (!isAccepted(event)) return;
        // Sin preventDefault el navegador no permite soltar aquí.
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setIsOver(false);
      }}
      onDrop={(event) => {
        if (!isAccepted(event)) return;
        event.preventDefault();
        reset();
        onDrop(event);
      }}
      className={tailwind('transition-colors', className, isOver && activeClassName)}
    >
      {children}
    </div>
  );
};
