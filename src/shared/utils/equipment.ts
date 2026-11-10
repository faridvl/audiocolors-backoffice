import { Equipment, EquipmentSummary } from '@/types/equipment/equipment';

/** Equipos con los que se puede registrar una audiometría nueva. */
export const getActiveEquipment = (equipment: Equipment[] | undefined): Equipment[] =>
  (equipment ?? []).filter((item) => item.isActive);

/** "Marca Modelo", como se muestra el equipo en selectores, la ficha y el informe. */
export const formatEquipmentName = (equipment: Pick<EquipmentSummary, 'brand' | 'model'>): string =>
  `${equipment.brand} ${equipment.model}`;
