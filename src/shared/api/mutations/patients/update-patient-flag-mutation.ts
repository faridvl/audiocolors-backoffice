import { useQueryClient } from '@tanstack/react-query';
import {
  handleLabConflict,
  isLabConflict,
} from '@/shared/api/mutations/patients/handle-lab-conflict';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_NOTES_KEY } from '@/shared/api/querys/patient-notes-query';
import { Patient, PatientFlag } from '@/types/patients/patient';

interface UpdatePatientFlagVariables {
  patientUuid: string;
  flag: PatientFlag;
  isOn: boolean;
  /** Solo audífonos en laboratorio: día de envío, "YYYY-MM-DD". */
  date?: string;
  /** Solo al corregir la fecha del envío abierto: el API rechaza con 409 si ya se entregó. */
  shipmentUuid?: string;
  /** Solo al marcar la prioridad: el API la exige y la deja en el Control de evolución. */
  priorityReason?: string;
}

/** Prende o apaga un indicador del paciente (audífonos en laboratorio, garantía activa). */
export function useUpdatePatientFlagMutation() {
  const queryClient = useQueryClient();
  const { mutate: executeUpdatePatientFlag, isPending } = useApiMutation<
    Patient,
    UpdatePatientFlagVariables
  >({
    mutationKey: ['updatePatientFlag'],
    mutationFn: ({ patientUuid, flag, isOn, date, shipmentUuid, priorityReason }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(`/patients/${patientUuid}/flags`, {
        [flag]: isOn,
        ...(date && { hearingAidsInLabDate: date }),
        ...(shipmentUuid && { shipmentUuid }),
        ...(priorityReason && { priorityReason }),
      }),
    // El API deja una nota en el Control de evolución con cada cambio de estos indicadores.
    onSuccess: (_updated, { patientUuid }) => {
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_NOTES_KEY, patientUuid],
      });
    },
    // El 409 se atiende aquí (no en el componente) para que funcione aunque el modal se haya cerrado.
    onError: (error, { patientUuid }) => {
      if (isLabConflict(error)) handleLabConflict(queryClient, patientUuid, error);
    },
  });

  return { executeUpdatePatientFlag, isPending };
}
