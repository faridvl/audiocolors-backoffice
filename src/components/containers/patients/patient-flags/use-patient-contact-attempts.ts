import { useUpdatePatientContactAttemptsMutation } from '@/shared/api/mutations/patients/update-patient-contact-attempts-mutation';
import { MAX_CONTACT_ATTEMPTS, Patient } from '@/types/patients/patient';

/** El contador de intentos de contacto del paciente: cada toque se guarda solo. */
export function usePatientContactAttempts(patient: Patient) {
  const { executeUpdatePatientContactAttempts, isPending } =
    useUpdatePatientContactAttemptsMutation();
  const count = patient.contactAttempts ?? 0;

  const save = (nextCount: number) => {
    if (isPending || nextCount === count) return;
    executeUpdatePatientContactAttempts({
      patientUuid: patient.uuid,
      count: nextCount,
    });
  };

  return {
    count,
    handleRegister: () => save(Math.min(count + 1, MAX_CONTACT_ATTEMPTS)),
    handleReset: () => save(0),
    isRegisterDisabled: isPending || count >= MAX_CONTACT_ATTEMPTS,
    isResetDisabled: isPending || count === 0,
    isSaving: isPending,
  };
}
