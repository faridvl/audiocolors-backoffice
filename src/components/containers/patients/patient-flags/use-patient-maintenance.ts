import { useUpdatePatientMaintenanceMutation } from '@/shared/api/mutations/patients/update-patient-maintenance-mutation';
import {
  getMaintenanceChoice,
  MAINTENANCE_NUMBERS,
  MaintenanceChoice,
  MaintenanceNumber,
  MaintenanceStatus,
  Patient,
} from '@/types/patients/patient';

export interface MaintenanceRow {
  maintenanceNumber: MaintenanceNumber;
  choice: MaintenanceChoice;
}

/** Los mantenimientos 1 a 4 del paciente: cada cambio se guarda al tocar. */
export function usePatientMaintenance(patient: Patient) {
  const { executeUpdatePatientMaintenance, isPending } = useUpdatePatientMaintenanceMutation();

  const rows: MaintenanceRow[] = MAINTENANCE_NUMBERS.map((maintenanceNumber) => ({
    maintenanceNumber,
    choice: getMaintenanceChoice(patient, maintenanceNumber),
  }));

  const handleChange = (maintenanceNumber: MaintenanceNumber, choice: MaintenanceChoice) => {
    if (isPending || choice === getMaintenanceChoice(patient, maintenanceNumber)) return;
    executeUpdatePatientMaintenance({
      patientUuid: patient.uuid,
      maintenanceNumber,
      status: choice === MaintenanceChoice.UNMARKED ? null : MaintenanceStatus[choice],
    });
  };

  return { rows, handleChange, isSaving: isPending };
}
