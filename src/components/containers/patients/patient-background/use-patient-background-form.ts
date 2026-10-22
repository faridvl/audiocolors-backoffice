import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FETCH_PATIENT_BACKGROUND_KEY } from '@/shared/api/querys/patient-background-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { useSavePatientBackgroundMutation } from '@/shared/api/mutations/patients/save-patient-background-mutation';
import { TEXT } from '@/static/texts/i18n';
import {
  BackgroundCondition,
  BackgroundConditions,
  PatientBackground,
  SavePatientBackgroundPayload,
} from '@/types/patients/patient-background';

export interface PatientBackgroundFormValues extends BackgroundConditions {
  tinnitusTone: string;
  otoscopyRight: string;
  otoscopyLeft: string;
}

function buildInitialValues(background: PatientBackground | null): PatientBackgroundFormValues {
  const conditions = Object.fromEntries(
    Object.values(BackgroundCondition).map((condition) => [
      condition,
      background?.[condition] ?? false,
    ]),
  ) as BackgroundConditions;

  return {
    ...conditions,
    tinnitusTone: background?.tinnitusTone ?? '',
    otoscopyRight: background?.otoscopyRight ?? '',
    otoscopyLeft: background?.otoscopyLeft ?? '',
  };
}

function toNullableText(value: string): string | null {
  return value.trim() || null;
}

export function usePatientBackgroundForm(
  patientUuid: string,
  background: PatientBackground | null,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeSavePatientBackground, isPending } = useSavePatientBackgroundMutation();

  const initialValues = useMemo(() => buildInitialValues(background), [background]);

  const handleSubmit = (values: PatientBackgroundFormValues) => {
    const payload: SavePatientBackgroundPayload = {
      ...values,
      // Sin acúfeno, una tonalidad escrita antes no tiene sentido guardarla.
      tinnitusTone: values.tinnitus ? toNullableText(values.tinnitusTone) : null,
      otoscopyRight: toNullableText(values.otoscopyRight),
      otoscopyLeft: toNullableText(values.otoscopyLeft),
      // El formulario no edita las notas: se reenvían para que el PUT no las borre.
      notes: background?.notes ?? null,
    };

    executeSavePatientBackground(
      { patientUuid, background: payload },
      {
        onSuccess: () => {
          toast.success(t(TEXT.PATIENTS.BACKGROUND.SAVED));
          void queryClient.invalidateQueries({
            queryKey: [FETCH_PATIENT_BACKGROUND_KEY, patientUuid],
          });
          // Al refrescar llega la historia guardada y la tarjeta pasa sola al resumen.
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return { initialValues, isPending, handleSubmit };
}
