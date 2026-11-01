import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usePatientQuery, FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { useUpdatePatientMutation } from '@/shared/api/mutations/patients/update-patient-mutation';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import {
  usePatientContactsQuery,
  FETCH_PATIENT_CONTACTS_KEY,
} from '@/shared/api/querys/patient-contacts-query';
import { useSyncPatientContactsMutation } from '@/shared/api/mutations/patients/sync-patient-contacts-mutation';
import { useNavigation } from '@/hooks/use-navigation';
import {
  DocumentType,
  getPatientBranchUuids,
  UpdatePatientPayload,
} from '@/types/patients/patient';
import { buildPatientFullName } from '@/components/containers/patients/patient-contacts/patient-name-fill-button';
import {
  buildInitialContacts,
  buildPatientEditValidationSchema,
  PatientFormValues,
  resolveContactsForSave,
} from '../patient-validation';

/** La API no guarda el tipo de documento; se infiere del formato guardado. */
function inferDocumentType(documentId?: string): DocumentType {
  if (!documentId) return DocumentType.NATIONAL;
  if (/^\d-\d{4}-\d{4}$/.test(documentId)) return DocumentType.NATIONAL;
  if (/^\d{11,12}$/.test(documentId)) return DocumentType.DIMEX;
  return DocumentType.PASSPORT;
}

export function usePatientEdit(uuid: string) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: patient, isLoading: isLoadingPatient, isError } = usePatientQuery(uuid);
  const { data: existingContacts, isLoading: isLoadingContacts } = usePatientContactsQuery(uuid);
  const { executeUpdatePatient, isPending: isUpdatingPatient } = useUpdatePatientMutation();
  const { executeSyncPatientContacts, isPending: isSyncingContacts } =
    useSyncPatientContactsMutation();

  const isLoading = isLoadingPatient || isLoadingContacts;
  const isPending = isUpdatingPatient || isSyncingContacts;

  const initialValues = useMemo<PatientFormValues | null>(
    () =>
      patient && existingContacts
        ? {
            firstName: patient.firstName ?? '',
            lastName: patient.lastName ?? '',
            documentType: inferDocumentType(patient.documentId),
            documentId: patient.documentId ?? '',
            // <input type="date"> exige exactamente YYYY-MM-DD.
            birthDate: patient.birthDate ? patient.birthDate.slice(0, 10) : '',
            gender: patient.gender ?? '',
            email: patient.email ?? '',
            address: patient.address ?? '',
            branchUuids: getPatientBranchUuids(patient),
            contacts: buildInitialContacts(
              existingContacts,
              patient.phone,
              buildPatientFullName(patient.firstName, patient.lastName),
            ),
          }
        : null,
    [patient, existingContacts],
  );

  const validationSchema = useMemo(
    () => buildPatientEditValidationSchema(initialValues?.contacts ?? []),
    [initialValues],
  );

  const handleSubmit = (values: PatientFormValues) => {
    setErrorMessage(null);

    const { phone, contacts } = resolveContactsForSave(
      values.contacts,
      buildPatientFullName(values.firstName, values.lastName),
    );
    const payload: UpdatePatientPayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone,
      ...(values.birthDate && { birthDate: values.birthDate }),
      documentId: values.documentId.trim(),
      email: values.email.trim().toLowerCase(),
      gender: values.gender,
      address: values.address.trim(),
      branchUuids: values.branchUuids,
    };

    executeUpdatePatient(
      { uuid, payload },
      {
        onSuccess: () => {
          executeSyncPatientContacts(
            { patientUuid: uuid, contacts },
            {
              onSuccess: () => {
                toast.success('Cambios guardados');
                void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, uuid] });
                void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
                void queryClient.invalidateQueries({
                  queryKey: [FETCH_PATIENT_CONTACTS_KEY, uuid],
                });
                void navigation.patients.detail(uuid);
              },
              onError: (error: Error) => setErrorMessage(error.message),
            },
          );
        },
        onError: (error: Error) => setErrorMessage(error.message),
      },
    );
  };

  return {
    patient,
    initialValues,
    validationSchema,
    isLoading,
    isError,
    isPending,
    errorMessage,
    handleSubmit,
    handleCancel: () => navigation.patients.detail(uuid),
  };
}
