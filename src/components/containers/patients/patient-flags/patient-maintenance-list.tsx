import React from 'react';
import { MAINTENANCE_NUMBERS, Patient } from '@/types/patients/patient';
import { PatientMaintenanceCard } from './patient-maintenance-card';

/** Los 4 mantenimientos lado a lado; en celular se apilan. */
export const PatientMaintenanceList: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="grid gap-3 sm:grid-cols-4">
    {MAINTENANCE_NUMBERS.map((maintenanceNumber) => (
      <PatientMaintenanceCard
        key={maintenanceNumber}
        patient={patient}
        maintenanceNumber={maintenanceNumber}
      />
    ))}
  </div>
);
