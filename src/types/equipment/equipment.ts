/** Topes iguales a los del API. */
export const EQUIPMENT_BRAND_MAX_LENGTH = 80;
export const EQUIPMENT_MODEL_MAX_LENGTH = 80;

/** Código de error con el que el API pide elegir el equipo de la audiometría. */
export const EQUIPMENT_REQUIRED_ERROR_CODE = 'EQUIPMENT_REQUIRED';

/** Código de error con el que el API rechaza un equipo con la misma marca y modelo. */
export const EQUIPMENT_ALREADY_EXISTS_ERROR_CODE = 'EQUIPMENT_ALREADY_EXISTS';

/** Equipo de audiometría de la clínica. Se crea, edita, desactiva y reactiva; nunca se borra. */
export interface Equipment {
  uuid: string;
  brand: string;
  model: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Equipo tal como lo trae una audiometría guardada. */
export interface EquipmentSummary {
  uuid: string;
  brand: string;
  model: string;
}

export interface CreateEquipmentPayload {
  brand: string;
  model: string;
}

export interface UpdateEquipmentPayload {
  brand?: string;
  model?: string;
  isActive?: boolean;
}
