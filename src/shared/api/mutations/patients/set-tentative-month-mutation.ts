import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';

interface SetTentativeMonthVariables {
  patientUuid: string;
  /** Mes tentativo en formato YYYY-MM. `null` lo limpia. */
  month: string | null;
  /** De que seria esa cita. Obligatorio al anotar un mes; se ignora al limpiar. */
  typeUUID?: string | null;
}

/**
 * Anota el mes tentativo de la proxima cita y de que seria, cuando todavia no
 * hay dia confirmado. El backend cancela la cita agendada que el paciente
 * tuviera: volver a "solo mes" significa que esa fecha dejo de valer.
 */
export function useSetTentativeMonthMutation() {
  const { mutate: executeSetTentativeMonth, isPending } = useApiMutation<
    unknown,
    SetTentativeMonthVariables
  >({
    mutationKey: ['setTentativeMonth'],
    mutationFn: ({ patientUuid, month, typeUUID }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put(
        `/patients/${patientUuid}/next-appointment/tentative-month`,
        { month, typeUUID: typeUUID ?? null },
      ),
  });

  return { executeSetTentativeMonth, isPending };
}
