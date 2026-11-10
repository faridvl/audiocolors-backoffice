import { useMemo } from 'react';
import { FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { TEXT } from '@/static/texts/i18n';
import {
  CreateEquipmentPayload,
  EQUIPMENT_ALREADY_EXISTS_ERROR_CODE,
  Equipment,
  UpdateEquipmentPayload,
} from '@/types/equipment/equipment';
import {
  EquipmentFormValues,
  buildCreateEquipmentPayload,
  buildEquipmentFormInitialValues,
  buildEquipmentFormSchema,
  buildUpdateEquipmentPayload,
} from './equipment-form';
import { EquipmentSaveCallbacks } from './use-equipment-settings';

interface UseEditEquipmentParams {
  /** Sin equipo, la ventana crea uno nuevo. */
  equipment: Equipment | null;
  onCreate: (payload: CreateEquipmentPayload, callbacks: EquipmentSaveCallbacks) => void;
  onUpdate: (
    equipmentUuid: string,
    changes: UpdateEquipmentPayload,
    callbacks: EquipmentSaveCallbacks,
  ) => void;
  onClose: () => void;
}

export function useEditEquipment({
  equipment,
  onCreate,
  onUpdate,
  onClose,
}: UseEditEquipmentParams) {
  const { t } = useTranslation();
  const isNew = equipment === null;
  const validationSchema = useMemo(() => buildEquipmentFormSchema(t), [t]);
  const initialValues = useMemo(() => buildEquipmentFormInitialValues(equipment), [equipment]);

  const handleSubmit = (
    values: EquipmentFormValues,
    helpers: FormikHelpers<EquipmentFormValues>,
  ) => {
    const callbacks: EquipmentSaveCallbacks = {
      onSuccess: () => helpers.setSubmitting(false),
      onError: (error: Error) => {
        helpers.setSubmitting(false);
        // El 409 sin código se toma por duplicado: es el único conflicto que tiene este formulario.
        const isDuplicate =
          error instanceof ApiError &&
          (error.code === EQUIPMENT_ALREADY_EXISTS_ERROR_CODE ||
            (!error.code && error.status === HttpStatus.CONFLICT));
        if (isDuplicate) {
          helpers.setFieldError('model', t(TEXT.SETTINGS.EQUIPMENT.DUPLICATE));
          return;
        }
        toast.error(error.message);
      },
    };

    if (!equipment) {
      onCreate(buildCreateEquipmentPayload(values), callbacks);
      return;
    }

    const changes = buildUpdateEquipmentPayload(equipment, values);
    if (Object.keys(changes).length === 0) {
      helpers.setSubmitting(false);
      onClose();
      return;
    }
    onUpdate(equipment.uuid, changes, callbacks);
  };

  return { isNew, initialValues, validationSchema, handleSubmit };
}
