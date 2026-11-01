import React from 'react';
import { MAINTENANCE_NUMBERS, Patient } from '@/types/patients/patient';
import { PatientMaintenanceCard } from './patient-maintenance-card';

/** Los 4 mantenimientos: apilados en celular, 2x2 en tableta y en una fila en escritorio. */
export const PatientMaintenanceList: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {MAINTENANCE_NUMBERS.map((maintenanceNumber) => (
      <PatientMaintenanceCard
        key={maintenanceNumber}
        patient={patient}
        maintenanceNumber={maintenanceNumber}
      />
    ))}
  </div>
);
