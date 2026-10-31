import {
  useIsSavingPatientContactAttempts,
  useUpdatePatientContactAttemptsMutation,
} from '@/shared/api/mutations/patients/update-patient-contact-attempts-mutation';
import { MAX_CONTACT_ATTEMPTS, Patient } from '@/types/patients/patient';

/** El contador de intentos de contacto del paciente: cada toque se guarda solo. */
export function usePatientContactAttempts(patient: Patient) {
  const { executeUpdatePatientContactAttempts } = useUpdatePatientContactAttemptsMutation(
    patient.uuid,
  );
  const isSaving = useIsSavingPatientContactAttempts(patient.uuid);
  const count = patient.contactAttempts ?? 0;

  const save = (nextCount: number) => {
    if (isSaving || nextCount === count) return;
    executeUpdatePatientContactAttempts({
      patientUuid: patient.uuid,
      count: nextCount,
      expectedCount: count,
    });
  };

  return {
    count,
    handleRegister: () => save(Math.min(count + 1, MAX_CONTACT_ATTEMPTS)),
    handleReset: () => save(0),
    isRegisterDisabled: isSaving || count >= MAX_CONTACT_ATTEMPTS,
    isResetDisabled: isSaving || count === 0,
    isSaving,
  };
}
