import type React from 'react';
import { useRef } from 'react';

/** Franja junto al borde (px) donde arrastrar desplaza la lista. */
const EDGE_SIZE_PX = 56;
/** Lo máximo que se desplaza en cada `dragover` (px), pegado al borde. */
const MAX_STEP_PX = 14;

/**
 * Desplaza un contenedor mientras se arrastra cerca de su borde de arriba o
 * de abajo. Durante un arrastre nativo Chrome no responde a la rueda del
 * mouse, así que sin esto un horario fuera de la vista sería inalcanzable.
 * Cuanto más cerca del borde, más rápido; por encima o por debajo de la
 * lista (el encabezado de la ventana), a toda velocidad. `handleDragOver` va
 * en un ancestro de la lista para recibir también esos bordes.
 */
export function useDragAutoScroll<Element extends HTMLElement>() {
  const containerRef = useRef<Element>(null);

  const handleDragOver = (event: React.DragEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const { top, bottom } = container.getBoundingClientRect();
    const distanceToTop = event.clientY - top;
    const distanceToBottom = bottom - event.clientY;

    const speed = (distance: number) => MAX_STEP_PX * (1 - Math.max(0, distance) / EDGE_SIZE_PX);

    if (distanceToTop < EDGE_SIZE_PX) container.scrollTop -= speed(distanceToTop);
    else if (distanceToBottom < EDGE_SIZE_PX) container.scrollTop += speed(distanceToBottom);
  };

  return { containerRef, handleDragOver };
}
