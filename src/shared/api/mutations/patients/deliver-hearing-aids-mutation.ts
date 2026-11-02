import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  handleLabConflict,
  isLabConflict,
} from '@/shared/api/mutations/patients/handle-lab-conflict';
import { useApiMutation } from '@/shared/api/mutations/use-api-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { FETCH_PATIENT_LAB_SHIPMENTS_KEY } from '@/shared/api/querys/patient-lab-shipments-query';
import { FETCH_PATIENT_NOTES_KEY } from '@/shared/api/querys/patient-notes-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';

interface DeliverHearingAidsVariables {
  patientUuid: string;
  /** Día de entrega, "YYYY-MM-DD". */
  deliveredAt: string;
  note?: string;
}

/**
 * Entrega los audífonos que estaban en el laboratorio. Con nota, el API también la deja en
 * Control de evolución: por eso se refrescan las notas. Los errores los muestra el formulario, salvo el 409 (pestaña vieja), que sale como aviso.
 */
export function useDeliverHearingAidsMutation() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate: executeDeliverHearingAids, isPending } = useApiMutation<
    Patient,
    DeliverHearingAidsVariables
  >({
    mutationKey: ['deliverHearingAids'],
    mutationFn: ({ patientUuid, deliveredAt, note }) =>
      ApiServiceClient(env.API.MEDICAL_RECORDS_URL).put<Patient>(`/patients/${patientUuid}/flags`, {
        hearingAidsInLab: false,
        deliveredAt,
        ...(note && { note }),
      }),
    onSuccess: (_patient, { patientUuid }) => {
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_KEY, patientUuid],
      });
      void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_LAB_SHIPMENTS_KEY, patientUuid],
      });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_ACTIVITY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [FETCH_PATIENT_NOTES_KEY, patientUuid],
      });
      toast.success(t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DELIVERY.TOAST));
    },
    onError: (error, { patientUuid }) => {
      if (isLabConflict(error)) handleLabConflict(queryClient, patientUuid, error);
    },
  });

  return { executeDeliverHearingAids, isPending };
}
