import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PillSelectOption } from '@/components/common/pill-select/pill-select';
import { useUpdatePatientMutation } from '@/shared/api/mutations/patients/update-patient-mutation';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { usePatientDocumentsQuery } from '@/shared/api/querys/patient-documents-query';
import { TEXT } from '@/static/texts/i18n';
import { DocumentCategory } from '@/types/documents/document.types';
import { Patient } from '@/types/patients/patient';

/** Valor de la opción "Ninguno": el selector no admite null. */
const NO_DOCUMENT_VALUE = '';

/** Elegir cuál de los archivos subidos como Garantías es el de la garantía del paciente. */
export function useWarrantyDocument(patient: Patient) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = usePatientDocumentsQuery(patient.uuid);
  const { executeUpdatePatient, isPending: isSaving } = useUpdatePatientMutation();

  const warrantyDocuments = useMemo(
    () => (documents ?? []).filter((document) => document.category === DocumentCategory.WARRANTY),
    [documents],
  );

  const options: PillSelectOption[] = useMemo(
    () => [
      { value: NO_DOCUMENT_VALUE, label: t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.NONE) },
      ...warrantyDocuments.map((document) => ({
        value: document.uuid,
        label: document.originalName,
      })),
    ],
    [warrantyDocuments, t],
  );

  // Si el archivo elegido se borró o cambió de categoría, el selector queda en "Ninguno".
  const selectedValue = warrantyDocuments.some(
    (document) => document.uuid === patient.warrantyDocumentUuid,
  )
    ? (patient.warrantyDocumentUuid ?? NO_DOCUMENT_VALUE)
    : NO_DOCUMENT_VALUE;

  const handleChange = (value: string) => {
    if (isSaving || value === selectedValue) return;
    const warrantyDocumentUuid = value === NO_DOCUMENT_VALUE ? null : value;
    executeUpdatePatient(
      { uuid: patient.uuid, payload: { warrantyDocumentUuid } },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_KEY, patient.uuid] });
          toast.success(
            t(
              warrantyDocumentUuid
                ? TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.SAVED
                : TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.CLEARED,
            ),
          );
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return {
    options,
    selectedValue,
    hasDocuments: warrantyDocuments.length > 0,
    isLoading,
    isSaving,
    handleChange,
  };
}
