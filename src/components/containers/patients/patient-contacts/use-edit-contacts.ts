import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import {
  FETCH_PATIENT_CONTACTS_KEY,
  usePatientContactsQuery,
} from '@/shared/api/querys/patient-contacts-query';
import { useUpdatePatientMutation } from '@/shared/api/mutations/patients/update-patient-mutation';
import { useSyncPatientContactsMutation } from '@/shared/api/mutations/patients/sync-patient-contacts-mutation';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import {
  buildInitialContacts,
  isSamePhone,
  PatientContactFormValues,
  resolveContactsForSave,
} from '@/components/containers/patients/patient-validation';
import { buildPatientFullName } from './patient-name-fill-button';

export interface EditContactsFormValues {
  contacts: PatientContactFormValues[];
}

/**
 * Editar los contactos desde el expediente. Guarda igual que el formulario del
 * paciente: el primero es el teléfono principal y va también en el paciente.
 */
export function useEditContacts(patient: Patient, onClose: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: existingContacts, isLoading } = usePatientContactsQuery(patient.uuid);
  const { executeUpdatePatient, isPending: isUpdatingPatient } = useUpdatePatientMutation();
  const { executeSyncPatientContacts, isPending: isSyncingContacts } =
    useSyncPatientContactsMutation();
  useEscapeKey(onClose);

  const patientFullName = buildPatientFullName(patient.firstName, patient.lastName);
  const initialValues: EditContactsFormValues | null = existingContacts
    ? { contacts: buildInitialContacts(existingContacts, patient.phone, patientFullName) }
    : null;

  const syncContacts = (contacts: PatientContactFormValues[]) =>
    executeSyncPatientContacts(
      { patientUuid: patient.uuid, contacts },
      {
        onSuccess: () => {
          toast.success(t(TEXT.PATIENTS.CONTACTS.SAVED));
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, patient.uuid] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
          void queryClient.invalidateQueries({
            queryKey: [FETCH_PATIENT_CONTACTS_KEY, patient.uuid],
          });
          onClose();
        },
        onError: (error: Error) => setErrorMessage(error.message),
      },
    );

  const handleSubmit = (values: EditContactsFormValues) => {
    setErrorMessage(null);
    const { phone, contacts } = resolveContactsForSave(values.contacts, patientFullName);

    // El teléfono del paciente solo se toca si cambió el contacto principal.
    if (phone && patient.phone && isSamePhone(phone, patient.phone)) {
      syncContacts(contacts);
      return;
    }

    executeUpdatePatient(
      { uuid: patient.uuid, payload: { phone } },
      {
        onSuccess: () => syncContacts(contacts),
        onError: (error: Error) => setErrorMessage(error.message),
      },
    );
  };

  return {
    initialValues,
    isLoading,
    isPending: isUpdatingPatient || isSyncingContacts,
    errorMessage,
    patientFullName,
    handleSubmit,
  };
}
