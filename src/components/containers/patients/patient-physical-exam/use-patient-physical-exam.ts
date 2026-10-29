import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { useSavePatientPhysicalExamMutation } from '@/shared/api/mutations/patients/save-patient-physical-exam-mutation';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { isForbiddenError } from '@/shared/api/querys/patient-background-query';
import {
  FETCH_PATIENT_PHYSICAL_EXAM_KEY,
  usePatientPhysicalExamQuery,
} from '@/shared/api/querys/patient-physical-exam-query';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';

export interface PhysicalExamFormValues {
  otoscopyRight: string;
  otoscopyLeft: string;
}

const toNullableText = (value: string) => value.trim() || null;

export function usePatientPhysicalExam(patientUuid: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const {
    data: exam,
    isLoading,
    isError,
    error,
    refetch,
  } = usePatientPhysicalExamQuery(patientUuid);
  const { executeSavePatientPhysicalExam, isPending } = useSavePatientPhysicalExamMutation();
  const [isEditing, setIsEditing] = useState(false);

  const initialValues = useMemo<PhysicalExamFormValues>(
    () => ({
      otoscopyRight: exam?.otoscopyRight ?? '',
      otoscopyLeft: exam?.otoscopyLeft ?? '',
    }),
    [exam],
  );

  const authorship = exam
    ? t(TEXT.PATIENTS.PHYSICAL_EXAM.UPDATED_BY, {
        author: resolveAuthorLabel(exam.updatedByUuid ?? exam.createdByUuid ?? ''),
        date: formatDate(exam.updatedAt),
      })
    : null;

  const handleSubmit = (values: PhysicalExamFormValues) => {
    executeSavePatientPhysicalExam(
      {
        patientUuid,
        exam: {
          otoscopyRight: toNullableText(values.otoscopyRight),
          otoscopyLeft: toNullableText(values.otoscopyLeft),
        },
      },
      {
        onSuccess: () => {
          toast.success(t(TEXT.PATIENTS.PHYSICAL_EXAM.SAVED));
          void queryClient.invalidateQueries({
            queryKey: [FETCH_PATIENT_PHYSICAL_EXAM_KEY, patientUuid],
          });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
          setIsEditing(false);
        },
        onError: (saveError: Error) => toast.error(saveError.message),
      },
    );
  };

  return {
    exam: exam ?? null,
    // STAFF no tiene acceso a lo clínico: la tarjeta no se muestra.
    isHidden: isForbiddenError(error),
    isLoading,
    isError,
    refetch: () => void refetch(),
    authorship,
    initialValues,
    isEditing,
    isPending,
    handleStartEdit: () => setIsEditing(true),
    handleCancelEdit: () => setIsEditing(false),
    handleSubmit,
  };
}
