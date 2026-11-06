import { useState } from "react";
import { MaintenanceNumber } from "@/types/patients/patient";

/** Qué mantenimiento tiene el panel de notas abierto: solo uno a la vez. */
export function useMaintenanceOpenRow() {
  const [openNumber, setOpenNumber] = useState<MaintenanceNumber | null>(null);

  return {
    openNumber,
    handleToggle: (maintenanceNumber: MaintenanceNumber) =>
      setOpenNumber((current) =>
        current === maintenanceNumber ? null : maintenanceNumber,
      ),
  };
}
