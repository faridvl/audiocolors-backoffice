import { useEffect, useRef, useState } from 'react';
import { MaintenanceNumber } from '@/types/patients/patient';

/** Qué mantenimiento tiene el panel de notas abierto: solo uno a la vez. */
export function useMaintenanceOpenRow() {
  const [openNumber, setOpenNumber] = useState<MaintenanceNumber | null>(null);
  const rowElements = useRef(new Map<MaintenanceNumber, HTMLElement>());

  // Se muestra la fila entera (título y estado incluidos), no solo el campo de la nota.
  useEffect(() => {
    if (openNumber === null) return;
    rowElements.current.get(openNumber)?.scrollIntoView({ block: 'nearest' });
  }, [openNumber]);

  return {
    openNumber,
    registerRow: (maintenanceNumber: MaintenanceNumber) => (element: HTMLElement | null) => {
      if (element) rowElements.current.set(maintenanceNumber, element);
      else rowElements.current.delete(maintenanceNumber);
    },
    getRowElement: (maintenanceNumber: MaintenanceNumber) =>
      rowElements.current.get(maintenanceNumber),
    handleOpen: (maintenanceNumber: MaintenanceNumber) => setOpenNumber(maintenanceNumber),
    handleToggle: (maintenanceNumber: MaintenanceNumber) =>
      setOpenNumber((current) => (current === maintenanceNumber ? null : maintenanceNumber)),
  };
}
