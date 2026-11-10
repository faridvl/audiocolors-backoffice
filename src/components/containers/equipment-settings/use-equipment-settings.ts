import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCreateEquipmentMutation } from '@/shared/api/mutations/equipment/create-equipment-mutation';
import { useUpdateEquipmentMutation } from '@/shared/api/mutations/equipment/update-equipment-mutation';
import { FETCH_EQUIPMENT_KEY, useEquipmentQuery } from '@/shared/api/querys/equipment-query';
import { TEXT } from '@/static/texts/i18n';
import {
  CreateEquipmentPayload,
  Equipment,
  UpdateEquipmentPayload,
} from '@/types/equipment/equipment';

/** Un guardado de la ventana: el hook de la lista decide a qué pantalla avisa y qué invalida. */
export interface EquipmentSaveCallbacks {
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function useEquipmentSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useEquipmentQuery();
  const { executeCreateEquipment, isPending: isCreating } = useCreateEquipmentMutation();
  const { executeUpdateEquipment, isPending: isUpdating } = useUpdateEquipmentMutation();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [changingUuid, setChangingUuid] = useState<string | null>(null);
  const [deactivatingUuid, setDeactivatingUuid] = useState<string | null>(null);

  const equipment = data ?? [];
  const editingEquipment = equipment.find((item) => item.uuid === editingUuid) ?? null;
  const deactivatingEquipment = equipment.find((item) => item.uuid === deactivatingUuid) ?? null;

  const refreshEquipment = () => queryClient.invalidateQueries({ queryKey: [FETCH_EQUIPMENT_KEY] });

  const handleCreate = (payload: CreateEquipmentPayload, callbacks: EquipmentSaveCallbacks) => {
    executeCreateEquipment(payload, {
      onSuccess: () => {
        toast.success(t(TEXT.SETTINGS.EQUIPMENT.CREATED));
        void refreshEquipment();
        setIsAdding(false);
        callbacks.onSuccess();
      },
      onError: callbacks.onError,
    });
  };

  const handleUpdate = (
    equipmentUuid: string,
    changes: UpdateEquipmentPayload,
    callbacks: EquipmentSaveCallbacks,
  ) => {
    executeUpdateEquipment(
      { equipmentUuid, changes },
      {
        onSuccess: () => {
          toast.success(t(TEXT.SETTINGS.EQUIPMENT.SAVED));
          void refreshEquipment();
          setEditingUuid(null);
          callbacks.onSuccess();
        },
        onError: callbacks.onError,
      },
    );
  };

  const changeActive = (item: Equipment, isActive: boolean, onDone?: () => void) => {
    setChangingUuid(item.uuid);
    executeUpdateEquipment(
      { equipmentUuid: item.uuid, changes: { isActive } },
      {
        onSuccess: () => {
          toast.success(
            t(isActive ? TEXT.SETTINGS.EQUIPMENT.REACTIVATED : TEXT.SETTINGS.EQUIPMENT.DEACTIVATED),
          );
          void refreshEquipment();
        },
        onError: (error: Error) => toast.error(error.message),
        onSettled: () => {
          setChangingUuid(null);
          onDone?.();
        },
      },
    );
  };

  return {
    equipment,
    isLoading,
    isError,
    refetch,
    editingEquipment,
    isAdding,
    deactivatingEquipment,
    changingUuid,
    isSaving: isCreating || isUpdating,
    handleAdd: () => setIsAdding(true),
    handleEdit: setEditingUuid,
    handleCloseModal: () => {
      setEditingUuid(null);
      setIsAdding(false);
    },
    handleCreate,
    handleUpdate,
    handleRequestDeactivate: (item: Equipment) => setDeactivatingUuid(item.uuid),
    handleCancelDeactivate: () => setDeactivatingUuid(null),
    handleConfirmDeactivate: () => {
      if (deactivatingEquipment) {
        changeActive(deactivatingEquipment, false, () => setDeactivatingUuid(null));
      }
    },
    handleReactivate: (item: Equipment) => changeActive(item, true),
  };
}
