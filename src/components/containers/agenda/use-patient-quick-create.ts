import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FormikHelpers } from 'formik';
import { useCreatePatientMutation } from '@/shared/api/mutations/patients/create-patient-mutation';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { resolveContactsForSave } from '@/components/containers/patients/patient-validation';
import { buildPatientFullName } from '@/components/containers/patients/patient-contacts/patient-name-fill-button';
import { TEXT } from '@/static/texts/i18n';
import { CreatePatientPayload, Patient } from '@/types/patients/patient';
import {
  buildPatientQuickCreateSchema,
  buildQuickCreateInitialValues,
  normalizeQuickCreateDocument,
  PatientQuickCreateValues,
} from './patient-quick-create-form';

/** El API responde con tildes ("cédula ya está registrada"): se quitan para comparar. */
const isDuplicateDocumentError = (message: string): boolean =>
  message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('cedula');

export function usePatientQuickCreate(searchTerm: string, onCreated: (patient: Patient) => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeCreatePatient, isPending } = useCreatePatientMutation();
  const { data: branches, isLoading: isLoadingBranches } = useBranchesQuery();

  const isBranchRequired = isLoadingBranches || (branches?.length ?? 0) > 0;
  const validationSchema = useMemo(
    () => buildPatientQuickCreateSchema(t, isBranchRequired),
    [t, isBranchRequired],
  );
  // Se calcula al abrir el formulario: lo que se siga escribiendo en la búsqueda no lo cambia.
  const initialValues = useMemo(
    () => buildQuickCreateInitialValues(searchTerm),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleSubmit = (
    values: PatientQuickCreateValues,
    helpers: FormikHelpers<PatientQuickCreateValues>,
  ) => {
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    // El primer contacto es el teléfono principal; sin nombre es el propio paciente.
    const { phone, contacts } = resolveContactsForSave(
      [{ name: '', phone: values.phone }],
      buildPatientFullName(firstName, lastName),
    );
    const payload: CreatePatientPayload = {
      firstName,
      lastName,
      phone,
      documentId: normalizeQuickCreateDocument(values.documentId),
      ...(values.branchUuid && { branchUuid: values.branchUuid }),
      contacts: contacts.map(({ name, phone: contactPhone }) => ({
        name,
        phone: contactPhone,
      })),
    };

    executeCreatePatient(payload, {
      onSuccess: (patient) => {
        toast.success(t(TEXT.AGENDA.PICKER.CREATE.SAVED));
        void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
        onCreated(patient);
      },
      onError: (error: Error) => {
        if (isDuplicateDocumentError(error.message)) {
          helpers.setFieldError(
            'documentId',
            t(TEXT.AGENDA.PICKER.CREATE.ERRORS.DOCUMENT_DUPLICATE),
          );
          return;
        }
        toast.error(error.message);
      },
    });
  };

  return {
    initialValues,
    validationSchema,
    handleSubmit,
    isPending,
    branches: branches ?? [],
  };
}
