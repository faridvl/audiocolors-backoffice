import type React from 'react';

/** Qué se está arrastrando en la agenda de escritorio. */
export enum AgendaDragKind {
  /** Un paciente con mes tentativo, desde "Por confirmar". */
  PENDING = 'pending',
  /** Una cita ya confirmada del día. */
  APPOINTMENT = 'appointment',
}

export interface AgendaDragPayload {
  kind: AgendaDragKind;
  /** UUID del paciente (PENDING) o de la cita (APPOINTMENT). */
  id: string;
}

/**
 * Tipo propio en el `dataTransfer`: así una zona de la agenda ignora lo que
 * no viene de la agenda (un archivo, un texto arrastrado desde otra ventana).
 * Qué se arrastra lo guarda el estado del hook, no el `dataTransfer`: así no
 * hay que serializar ni validar nada al soltar.
 */
const DRAG_FORMAT = 'application/x-audiocolors-agenda';

/** Marca el arrastre como de la agenda. Firefox no inicia un arrastre sin `setData`. */
export function markAgendaDrag(event: React.DragEvent, payload: AgendaDragPayload) {
  event.dataTransfer.setData(DRAG_FORMAT, payload.id);
  event.dataTransfer.effectAllowed = 'move';
}

export function isAgendaDrag(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes(DRAG_FORMAT);
}
