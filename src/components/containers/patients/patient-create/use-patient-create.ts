import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FormikHelpers } from 'formik';
import { useCreatePatientMutation } from '@/shared/api/mutations/patients/create-patient-mutation';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { useNavigation } from '@/hooks/use-navigation';
import { CreatePatientPayload, DocumentType } from '@/types/patients/patient';
import { PatientFormValues } from '../patient-validation';

export const patientCreateInitialValues: PatientFormValues = {
  firstName: '',
  lastName: '',
  documentType: DocumentType.NATIONAL,
  documentId: '',
  birthDate: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  branchUuid: '',
  contacts: [],
};

/** Traduce errores del API a mensajes de campo cuando se puede identificar. */
function resolveFieldError(message: string): { field: keyof PatientFormValues; text: string } | null {
  // El API responde con tildes ("cédula ya está registrada"): se normaliza
  // quitando diacríticos para que el .includes() no falle por eso.
  const normalized = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  if (normalized.includes('cedula') || normalized.includes('documentid')) {
    return { field: 'documentId', text: 'Esta cédula ya está registrada' };
  }
  if (normalized.includes('email') || normalized.includes('correo')) {
    return { field: 'email', text: 'Este correo ya está registrado' };
  }

  return null;
}

export function usePatientCreate() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { executeCreatePatient, isPending } = useCreatePatientMutation();

  const handleSubmit = (
    values: PatientFormValues,
    helpers: FormikHelpers<PatientFormValues>,
  ) => {
    setErrorMessage(null);

    const payload: CreatePatientPayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: `+506 ${values.phone}`,
      birthDate: values.birthDate,
      documentId: values.documentId.trim(),
      ...(values.email.trim() && { email: values.email.trim().toLowerCase() }),
      ...(values.gender && { gender: values.gender }),
      ...(values.address.trim() && { address: values.address.trim() }),
      ...(values.branchUuid && { branchUuid: values.branchUuid }),
      ...(values.contacts.length > 0 && {
        contacts: values.contacts
          .filter((contact) => contact.name.trim() && contact.phone.trim())
          .map((contact) => ({ name: contact.name.trim(), phone: contact.phone.trim() })),
      }),
    };

    executeCreatePatient(payload, {
      onSuccess: (patient) => {
        toast.success('Paciente registrado');
        void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
        void navigation.patients.detail(patient.uuid);
      },
      onError: (error: Error) => {
        const fieldError = resolveFieldError(error.message);

        if (fieldError) {
          helpers.setFieldError(fieldError.field, fieldError.text);
          return;
        }

        setErrorMessage(error.message);
      },
    });
  };

  return {
    handleSubmit,
    isPending,
    errorMessage,
    handleCancel: navigation.patients.list,
  };
}
