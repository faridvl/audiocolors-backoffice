/** Largo máximo de la nota de una entrega (el API la rechaza si lo pasa). */
export const LAB_DELIVERY_NOTE_MAX_LENGTH = 1000;

/** Un envío de audífonos al laboratorio; sin `deliveredAt` sigue en el laboratorio. */
export interface PatientLabShipment {
  uuid: string;
  /** Días de calendario, "YYYY-MM-DD". */
  sentAt: string;
  deliveredAt: string | null;
  note: string | null;
  createdByUuid: string | null;
  createdByName: string | null;
  deliveredByUuid: string | null;
  deliveredByName: string | null;
}
