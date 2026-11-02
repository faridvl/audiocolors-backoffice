import { useQuery } from '@tanstack/react-query';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientLabShipment } from '@/types/patients/patient-lab-shipment';

export const FETCH_PATIENT_LAB_SHIPMENTS_KEY = 'fetchPatientLabShipments';

/** El API devuelve el historial de envíos del más reciente al más viejo. */
export function usePatientLabShipmentsQuery(patientUuid: string) {
  return useQuery({
    queryKey: [FETCH_PATIENT_LAB_SHIPMENTS_KEY, patientUuid],
    queryFn: () =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<PatientLabShipment[]>(
        `/patients/${patientUuid}/lab-shipments`,
      ),
    enabled: !!patientUuid,
    staleTime: 1000 * 60 * 2,
  });
}
