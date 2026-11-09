import { useState } from 'react';
import { MaintenanceNote } from '@/types/patients/patient-maintenance';

/** Notas que se ven sin expandir; con más, aparece "Ver todas". */
const COLLAPSED_NOTES = 2;

/** Cuántas notas de un mantenimiento se muestran: las 2 más nuevas hasta que se expande. */
export function useMaintenanceNotes(notes: MaintenanceNote[]) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = notes.length > COLLAPSED_NOTES;
  const visibleNotes = canExpand && !isExpanded ? notes.slice(0, COLLAPSED_NOTES) : notes;

  return {
    visibleNotes,
    canExpand,
    isExpanded,
    total: notes.length,
    handleToggle: () => setIsExpanded((current) => !current),
  };
}
