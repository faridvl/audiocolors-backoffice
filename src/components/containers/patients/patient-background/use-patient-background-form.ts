import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSavePatientBackgroundMutation } from '@/shared/api/mutations/patients/save-patient-background-mutation';
import { useUploadDocumentMutation } from '@/shared/api/mutations/documents/upload-document-mutation';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_PATIENT_BACKGROUND_KEY } from '@/shared/api/querys/patient-background-query';
import { FETCH_PATIENT_DOCUMENTS_KEY } from '@/shared/api/querys/patient-documents-query';
import { usePatientQuery } from '@/shared/api/querys/get-patient-query';
import { useSession } from '@/hooks/use-session';
import { formatDate, getFullName } from '@/shared/utils/formatters';
import { toDayKey } from '@/shared/utils/dates';
import { TEXT } from '@/static/texts/i18n';
import { ClinicalField } from '@/types/clinical-templates/clinical-template';
import { DocumentCategory } from '@/types/documents/document.types';
import { PatientBackground } from '@/types/patients/patient-background';
import { buildBackgroundChanges } from './background-changes';
import { buildClinicalHistoryPdf } from './clinical-history-pdf';
import {
  buildFormValues,
  buildPayload,
  buildStandardFields,
  ClinicalHistoryFormValues,
  collectRemovedQuestions,
  resolveAnswers,
} from './clinical-history';

/** Llenarla por primera vez, o editarla: se actualiza y lo que cambió queda como PDF en Archivos. */
export enum BackgroundFormMode {
  FILL = 'FILL',
  UPDATE = 'UPDATE',
}

const PDF_MIME_TYPE = 'application/pdf';

interface UsePatientBackgroundFormOptions {
  patientUuid: string;
  background: PatientBackground | null;
  fields: ClinicalField[];
  mode: BackgroundFormMode;
  onDone: () => void;
}

export function usePatientBackgroundForm({
  patientUuid,
  background,
  fields,
  mode,
  onDone,
}: UsePatientBackgroundFormOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: patient } = usePatientQuery(patientUuid);
  const { executeSavePatientBackground, isPending: isSaving } = useSavePatientBackgroundMutation();
  const { executeUploadDocument, isPending: isUploading } = useUploadDocumentMutation();
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);

  const originalAnswers = useMemo(
    () => (background ? resolveAnswers(background) : {}),
    [background],
  );
  const initialValues = useMemo(
    () => buildFormValues(fields, originalAnswers),
    [fields, originalAnswers],
  );

  // Las respuestas de preguntas que la clínica quitó después no se pierden al editar.
  const removedQuestions = useMemo(
    () =>
      collectRemovedQuestions(
        fields,
        originalAnswers,
        background?.templateSnapshot ?? buildStandardFields(t),
      ),
    [fields, originalAnswers, background, t],
  );

  const saveFirstTime = (values: ClinicalHistoryFormValues) => {
    executeSavePatientBackground(
      {
        patientUuid,
        background: buildPayload(fields, values, background?.notes ?? null, removedQuestions),
      },
      {
        onSuccess: () => {
          toast.success(t(TEXT.PATIENTS.BACKGROUND.SAVED));
          // Al refrescar llega la historia guardada y la tarjeta pasa sola al resumen.
          void queryClient.invalidateQueries({
            queryKey: [FETCH_PATIENT_BACKGROUND_KEY, patientUuid],
          });
          void queryClient.invalidateQueries({
            queryKey: [FETCH_PATIENT_ACTIVITY_KEY],
          });
          onDone();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const saveUpdate = async (values: ClinicalHistoryFormValues) => {
    const changes = buildBackgroundChanges(t, fields, originalAnswers, values);
    if (changes.length === 0) {
      toast.info(t(TEXT.PATIENTS.BACKGROUND.UPDATE.NO_CHANGES));
      return;
    }

    const today = new Date();
    setIsBuildingPdf(true);
    let pdf: Blob;
    try {
      pdf = await buildClinicalHistoryPdf({
        t,
        patientName: patient ? getFullName(patient.firstName, patient.lastName) : '',
        authorName: user?.fullName ?? '',
        dateLabel: formatDate(today.toISOString()),
        fields,
        values,
        changes,
      });
    } catch {
      toast.error(t(TEXT.PATIENTS.BACKGROUND.UPDATE.PDF_ERROR));
      return;
    } finally {
      setIsBuildingPdf(false);
    }

    const fileName = `${t(TEXT.PATIENTS.BACKGROUND.UPDATE.FILE_NAME, { date: toDayKey(today) })}.pdf`;
    const refreshAfterUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_BACKGROUND_KEY, patientUuid] });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_DOCUMENTS_KEY, patientUuid] });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
      onDone();
    };

    // La historia queda con lo último; el PDF en Archivos es el registro de qué cambió y quién.
    executeSavePatientBackground(
      {
        patientUuid,
        background: buildPayload(fields, values, background?.notes ?? null, removedQuestions),
      },
      {
        onSuccess: () =>
          executeUploadDocument(
            {
              patientUuid,
              file: new File([pdf], fileName, { type: PDF_MIME_TYPE }),
              category: DocumentCategory.CLINICAL_HISTORY,
              fileName,
            },
            {
              onSuccess: () => {
                toast.success(t(TEXT.PATIENTS.BACKGROUND.UPDATE.SAVED));
                refreshAfterUpdate();
              },
              onError: () => {
                toast.error(t(TEXT.PATIENTS.BACKGROUND.UPDATE.PDF_UPLOAD_ERROR));
                refreshAfterUpdate();
              },
            },
          ),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleSubmit = (values: ClinicalHistoryFormValues) => {
    if (mode === BackgroundFormMode.UPDATE && background) {
      void saveUpdate(values);
      return;
    }
    saveFirstTime(values);
  };

  return {
    initialValues,
    isPending: isSaving || isUploading || isBuildingPdf,
    handleSubmit,
  };
}
