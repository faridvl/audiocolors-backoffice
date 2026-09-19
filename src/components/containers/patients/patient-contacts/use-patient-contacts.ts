import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PatientContact } from '@/types/patients/patient-contact';
import {
  usePatientContactsQuery,
  FETCH_PATIENT_CONTACTS_KEY,
} from '@/shared/api/querys/patient-contacts-query';
import { useCreatePatientContactMutation } from '@/shared/api/mutations/patients/create-patient-contact-mutation';
import { useDeletePatientContactMutation } from '@/shared/api/mutations/patients/delete-patient-contact-mutation';
import { formatPhone } from '@/components/containers/patients/patient-validation';

const NAME_MAX_LENGTH = 80;
const PHONE_MAX_LENGTH = 20;

export function usePatientContacts(patientUuid: string) {
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactToDelete, setContactToDelete] = useState<PatientContact | null>(null);

  const { data, isLoading, isError, refetch } = usePatientContactsQuery(patientUuid);
  const { executeCreatePatientContact, isPending: isCreating } = useCreatePatientContactMutation();
  const { executeDeletePatientContact, isPending: isDeleting } = useDeletePatientContactMutation();

  const contacts = data ?? [];

  const invalidateContacts = () =>
    queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_CONTACTS_KEY, patientUuid] });

  const handlePhoneChange = (value: string) => setPhone(formatPhone(value));

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0;

  const resetForm = () => {
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleStartAdding = () => setIsAdding(true);
  const handleCancelAdding = () => resetForm();

  const handleAddContact = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      toast.error('Completa el nombre y el teléfono');
      return;
    }

    executeCreatePatientContact(
      {
        patientUuid,
        name: trimmedName.slice(0, NAME_MAX_LENGTH),
        phone: trimmedPhone.slice(0, PHONE_MAX_LENGTH),
      },
      {
        onSuccess: () => {
          toast.success('Teléfono agregado');
          resetForm();
          void invalidateContacts();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!contactToDelete) return;

    executeDeletePatientContact(
      { patientUuid, contactUuid: contactToDelete.uuid },
      {
        onSuccess: () => {
          toast.success('Teléfono eliminado');
          setContactToDelete(null);
          void invalidateContacts();
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setContactToDelete(null);
        },
      },
    );
  };

  return {
    contacts,
    isLoading,
    isError,
    refetch,
    isAdding,
    handleStartAdding,
    handleCancelAdding,
    name,
    setName,
    phone,
    handlePhoneChange,
    canSubmit,
    handleAddContact,
    isCreating,
    contactToDelete,
    setContactToDelete,
    handleConfirmDelete,
    isDeleting,
  };
}
