import * as Yup from 'yup';
import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import {
  CreateEquipmentPayload,
  EQUIPMENT_BRAND_MAX_LENGTH,
  EQUIPMENT_MODEL_MAX_LENGTH,
  Equipment,
  UpdateEquipmentPayload,
} from '@/types/equipment/equipment';

export interface EquipmentFormValues {
  brand: string;
  model: string;
}

export const buildEquipmentFormInitialValues = (
  equipment: Equipment | null,
): EquipmentFormValues => ({
  brand: equipment?.brand ?? '',
  model: equipment?.model ?? '',
});

export const buildEquipmentFormSchema = (t: TFunction) =>
  Yup.object({
    brand: Yup.string()
      .trim()
      .required(t(TEXT.SETTINGS.EQUIPMENT.BRAND_REQUIRED))
      .max(EQUIPMENT_BRAND_MAX_LENGTH, t(TEXT.SETTINGS.EQUIPMENT.BRAND_TOO_LONG)),
    model: Yup.string()
      .trim()
      .required(t(TEXT.SETTINGS.EQUIPMENT.MODEL_REQUIRED))
      .max(EQUIPMENT_MODEL_MAX_LENGTH, t(TEXT.SETTINGS.EQUIPMENT.MODEL_TOO_LONG)),
  });

export const buildCreateEquipmentPayload = (
  values: EquipmentFormValues,
): CreateEquipmentPayload => ({
  brand: values.brand.trim(),
  model: values.model.trim(),
});

/** Solo lo que cambió. */
export function buildUpdateEquipmentPayload(
  equipment: Equipment,
  values: EquipmentFormValues,
): UpdateEquipmentPayload {
  const changes: UpdateEquipmentPayload = {};
  const brand = values.brand.trim();
  const model = values.model.trim();
  if (brand !== equipment.brand) changes.brand = brand;
  if (model !== equipment.model) changes.model = model;
  return changes;
}
