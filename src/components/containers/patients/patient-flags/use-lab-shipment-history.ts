import { useState } from 'react';
import { usePatientLabShipmentsQuery } from '@/shared/api/querys/patient-lab-shipments-query';

/** Envíos que se ven sin expandir; con más, aparece "Ver todos". */
export const COLLAPSED_SHIPMENTS = 3;

/** Historial de envíos al laboratorio: los 3 más recientes hasta que se expande. */
export function useLabShipmentHistory(patientUuid: string) {
  const { data, isLoading, isError, refetch } = usePatientLabShipmentsQuery(patientUuid);
  const [isExpanded, setIsExpanded] = useState(false);
  const shipments = data ?? [];
  const canExpand = shipments.length > COLLAPSED_SHIPMENTS;

  return {
    shipments: canExpand && !isExpanded ? shipments.slice(0, COLLAPSED_SHIPMENTS) : shipments,
    total: shipments.length,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && shipments.length === 0,
    canExpand,
    isExpanded,
    handleRetry: () => void refetch(),
    handleToggle: () => setIsExpanded((current) => !current),
  };
}
