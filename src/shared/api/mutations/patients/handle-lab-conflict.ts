import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENT_LAB_SHIPMENTS_KEY } from '@/shared/api/querys/patient-lab-shipments-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';

/** Un 409 del laboratorio es una pestaña vieja: se avisa con el texto del API y se recarga lo que se ve. */
export function isLabConflict(error: Error): boolean {
  return error instanceof ApiError && error.status === HttpStatus.CONFLICT;
}

export function handleLabConflict(queryClient: QueryClient, patientUuid: string, error: Error) {
  toast.error(error.message);
  void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, patientUuid] });
  void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
  void queryClient.invalidateQueries({
    queryKey: [FETCH_PATIENT_LAB_SHIPMENTS_KEY, patientUuid],
  });
}
