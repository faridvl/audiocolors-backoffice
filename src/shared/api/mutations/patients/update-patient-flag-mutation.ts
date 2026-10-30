import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { Patient, PatientFlag } from '@/types/patients/patient';

interface UpdatePatientFlagVariables {
  patientUuid: string;
  flag: PatientFlag;
  isOn: boolean;
  /** Solo audífonos en laboratorio: día de envío, "YYYY-MM-DD". */
  date?: string;
}

/** Prende o apaga un indicador del paciente (audífonos en laboratorio, garantía activa). */
export function useUpdatePatientFlagMutation() {
  const { mutate: executeUpdatePatientFlag, isPending } = useApiMutation<
    Patient,
    UpdatePatientFlagVariables
  >({
    mutationKey: ['updatePatientFlag'],
    mutationFn: ({ patientUuid, flag, isOn, date }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(`/patients/${patientUuid}/flags`, {
        [flag]: isOn,
        ...(date && { hearingAidsInLabDate: date }),
      }),
  });

  return { executeUpdatePatientFlag, isPending };
}
