import { useUpdatePatientMaintenanceMutation } from '@/shared/api/mutations/patients/update-patient-maintenance-mutation';
import { usePatientMaintenancesQuery } from '@/shared/api/querys/patient-maintenances-query';
import {
  getMaintenanceStatus,
  MAINTENANCE_NUMBERS,
  MaintenanceNumber,
  MaintenanceStatus,
  Patient,
} from '@/types/patients/patient';
import { MaintenanceNote } from '@/types/patients/patient-maintenance';

export interface MaintenanceRow {
  maintenanceNumber: MaintenanceNumber;
  status: MaintenanceStatus;
  notes: MaintenanceNote[];
}

/**
 * Los mantenimientos 1 a 4: el estado sale del paciente (siempre al día tras guardar) y las
 * notas de su propia consulta, que se pide al abrir la pestaña.
 */
export function usePatientMaintenance(patient: Patient) {
  const { executeUpdatePatientMaintenance, isPending } = useUpdatePatientMaintenanceMutation();
  const { data: maintenances, isLoading, isError } = usePatientMaintenancesQuery(patient.uuid);

  const rows: MaintenanceRow[] = MAINTENANCE_NUMBERS.map((maintenanceNumber) => ({
    maintenanceNumber,
    status: getMaintenanceStatus(patient, maintenanceNumber),
    notes: maintenances?.find((item) => item.number === maintenanceNumber)?.notes ?? [],
  }));

  const handleStatusChange = (maintenanceNumber: MaintenanceNumber, status: MaintenanceStatus) => {
    if (isPending || status === getMaintenanceStatus(patient, maintenanceNumber)) return;
    executeUpdatePatientMaintenance({ patientUuid: patient.uuid, maintenanceNumber, status });
  };

  return {
    rows,
    handleStatusChange,
    isSaving: isPending,
    isLoadingNotes: isLoading,
    hasNotesError: isError,
  };
}
