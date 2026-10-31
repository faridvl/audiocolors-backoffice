import { useTranslation } from 'react-i18next';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiError, ApiServiceClient, HttpStatus } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { TEXT } from '@/static/texts/i18n';
import { MAX_CONTACT_ATTEMPTS, Patient } from '@/types/patients/patient';

const UPDATE_PATIENT_CONTACT_ATTEMPTS_KEY = 'updatePatientContactAttempts';

interface UpdatePatientContactAttemptsVariables {
  patientUuid: string;
  /** Valor absoluto: 0 reinicia el contador. */
  count: number;
  /** El valor que la persona ve en pantalla: el API rechaza (409) si ya cambió. */
  expectedCount: number;
}

/**
 * Hay un guardado en curso para este paciente. Se lee de la caché de mutaciones y no del hook
 * que la lanzó, para que siga valiendo si se sale de la pestaña y se vuelve.
 */
export function useIsSavingPatientContactAttempts(patientUuid: string): boolean {
  return (
    useIsMutating({
      mutationKey: [UPDATE_PATIENT_CONTACT_ATTEMPTS_KEY, patientUuid],
    }) > 0
  );
}

/**
 * Guarda el contador de intentos de contacto del paciente.
 * El resultado se refleja desde las opciones de la mutación y no desde `mutate`, para que
 * el expediente se actualice aunque el modal ya se haya cerrado.
 */
export function useUpdatePatientContactAttemptsMutation(patientUuid: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: executeUpdatePatientContactAttempts } = useApiMutation<
    Patient,
    UpdatePatientContactAttemptsVariables
  >({
    mutationKey: [UPDATE_PATIENT_CONTACT_ATTEMPTS_KEY, patientUuid],
    mutationFn: ({ patientUuid: targetUuid, count, expectedCount }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(
        `/patients/${targetUuid}/contact-attempts`,
        { count, expectedCount },
      ),
    onSuccess: (updated, { patientUuid: targetUuid, count }) => {
      queryClient.setQueryData([FETCH_PATIENT_KEY, targetUuid], (previous?: Patient) =>
        previous ? { ...previous, contactAttempts: updated.contactAttempts ?? 0 } : previous,
      );
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_KEY, targetUuid],
      });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_ACTIVITY_KEY],
      });
      toast.success(
        count === 0
          ? t(TEXT.PATIENTS.FLAGS.CONTACT.TOAST_RESET)
          : t(TEXT.PATIENTS.FLAGS.CONTACT.TOAST, {
              count,
              max: MAX_CONTACT_ATTEMPTS,
            }),
      );
    },
    onError: (error, { patientUuid: targetUuid }) => {
      if (error instanceof ApiError && error.status === HttpStatus.CONFLICT) {
        toast.error(t(TEXT.PATIENTS.FLAGS.CONTACT.TOAST_CONFLICT));
        void queryClient.invalidateQueries({
          queryKey: [FETCH_PATIENT_KEY, targetUuid],
        });
        void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
        return;
      }
      toast.error(error.message);
    },
  });

  return { executeUpdatePatientContactAttempts };
}
