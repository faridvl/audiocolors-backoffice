import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { PatientContact, SyncPatientContactItem } from '@/types/patients/patient-contact';

interface SyncPatientContactsVariables {
  patientUuid: string;
  contacts: SyncPatientContactItem[];
}

/** Reemplaza la lista completa de contactos de un paciente: el API reconcilia (crea/actualiza/elimina). */
export function useSyncPatientContactsMutation() {
  const { mutate: executeSyncPatientContacts, isPending } = useApiMutation<
    PatientContact[],
    SyncPatientContactsVariables
  >({
    mutationKey: ['syncPatientContacts'],
    mutationFn: ({ patientUuid, contacts }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<PatientContact[]>(
        `/patients/${patientUuid}/contacts`,
        { contacts },
      ),
  });

  return { executeSyncPatientContacts, isPending };
}
