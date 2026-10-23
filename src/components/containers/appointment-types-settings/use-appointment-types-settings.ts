import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateAppointmentTypeMutation } from '@/shared/api/mutations/appointment-types/update-appointment-type-mutation';
import {
  FETCH_APPOINTMENT_TYPES_KEY,
  useAppointmentTypesQuery,
} from '@/shared/api/querys/appointment-types-query';
import { TEXT } from '@/static/texts/i18n';
import { UpdateAppointmentTypePayload } from '@/types/appointments/appointment-type';

export function useAppointmentTypesSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: appointmentTypes, isLoading, isError, refetch } = useAppointmentTypesQuery();
  const { executeUpdateAppointmentType, isPending } = useUpdateAppointmentTypeMutation();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);

  const types = appointmentTypes ?? [];
  const editingType = types.find((type) => type.uuid === editingUuid) ?? null;

  const handleSave = (typeUuid: string, changes: UpdateAppointmentTypePayload) => {
    executeUpdateAppointmentType(
      { typeUuid, changes },
      {
        onSuccess: () => {
          toast.success(t(TEXT.SETTINGS.APPOINTMENT_TYPES.SAVED));
          // Marcar un control desmarca el anterior: se vuelve a pedir la lista entera.
          void queryClient.invalidateQueries({ queryKey: [FETCH_APPOINTMENT_TYPES_KEY] });
          setEditingUuid(null);
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return {
    appointmentTypes: types,
    currentControl: types.find((type) => type.isControl) ?? null,
    editingType,
    isLoading,
    isError,
    refetch,
    isSaving: isPending,
    handleEdit: setEditingUuid,
    handleCloseEdit: () => setEditingUuid(null),
    handleSave,
  };
}
