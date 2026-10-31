import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';

interface UpdatePatientContactAttemptsVariables {
  patientUuid: string;
  /** Valor absoluto: 0 reinicia el contador. */
  count: number;
}

/**
 * Guarda el contador de intentos de contacto del paciente.
 * El resultado se refleja desde las opciones de la mutación y no desde `mutate`, para que
 * el expediente se actualice aunque el modal ya se haya cerrado.
 */
export function useUpdatePatientContactAttemptsMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: executeUpdatePatientContactAttempts, isPending } = useApiMutation<
    Patient,
    UpdatePatientContactAttemptsVariables
  >({
    mutationKey: ['updatePatientContactAttempts'],
    mutationFn: ({ patientUuid, count }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(
        `/patients/${patientUuid}/contact-attempts`,
        { count },
      ),
    onSuccess: (updated, { patientUuid, count }) => {
      queryClient.setQueryData([FETCH_PATIENT_KEY, patientUuid], (previous?: Patient) =>
        previous ? { ...previous, contactAttempts: updated.contactAttempts ?? 0 } : previous,
      );
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_KEY, patientUuid],
      });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_ACTIVITY_KEY],
      });
      toast.success(
        count === 0
          ? t(TEXT.PATIENTS.FLAGS.CONTACT.TOAST_RESET)
          : t(TEXT.PATIENTS.FLAGS.CONTACT.TOAST, { count }),
      );
    },
    onError: (error) => toast.error(error.message),
  });

  return { executeUpdatePatientContactAttempts, isPending };
}
