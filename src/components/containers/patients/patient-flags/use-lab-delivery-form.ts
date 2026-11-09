import { useEffect, useRef, useState } from 'react';
import { ApiError, HttpStatus } from '@/shared/api/api-service-client';
import { isLabConflict } from '@/shared/api/mutations/patients/handle-lab-conflict';
import { useDeliverHearingAidsMutation } from '@/shared/api/mutations/patients/deliver-hearing-aids-mutation';
import { Permission } from '@/shared/auth/permissions';
import { toClinicDayKey } from '@/shared/utils/dates';
import { usePermissions } from '@/hooks/use-permissions';
import { Patient } from '@/types/patients/patient';
import { LAB_DELIVERY_NOTE_MAX_LENGTH } from '@/types/patients/patient-lab-shipment';

interface UseLabDeliveryFormOptions {
  patient: Patient;
  onDelivered: () => void;
  /** Avisa si hay algo que no debe perderse (guardando o nota escrita) para no cerrar el modal. */
  onGuardChange: (isGuarded: boolean) => void;
}

/**
 * Entrega de los audífonos: fecha (hoy por defecto) y nota opcional. Las fechas fuera de rango
 * las rechaza el API y su mensaje se muestra junto al formulario, que sigue abierto.
 */
export function useLabDeliveryForm({
  patient,
  onDelivered,
  onGuardChange,
}: UseLabDeliveryFormOptions) {
  const { can } = usePermissions();
  // La nota también va a Control de evolución: solo la escribe quien puede verlo.
  const canWriteNote = can(Permission.VIEW_CLINICAL_RECORD);
  const { executeDeliverHearingAids } = useDeliverHearingAidsMutation();
  const today = toClinicDayKey(new Date().toISOString());
  const sentDay = patient.hearingAidsInLabSince
    ? toClinicDayKey(patient.hearingAidsInLabSince)
    : undefined;
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // El 400 del API es una fecha fuera de rango: se muestra bajo el campo.
  const [dateErrorMessage, setDateErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // El ref corta el segundo clic del mismo instante, antes de que el estado se repinte.
  const savingRef = useRef(false);

  const isGuarded = isSaving || note.trim().length > 0;
  useEffect(() => {
    onGuardChange(isGuarded);
  }, [isGuarded, onGuardChange]);
  useEffect(() => () => onGuardChange(false), [onGuardChange]);

  const releaseSaving = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setErrorMessage(null);
    setDateErrorMessage(null);
  };

  const handleNoteChange = (value: string) => {
    setNote(value.slice(0, LAB_DELIVERY_NOTE_MAX_LENGTH));
    setErrorMessage(null);
  };

  const handleSave = () => {
    if (savingRef.current || !date) return;
    savingRef.current = true;
    setIsSaving(true);
    setErrorMessage(null);
    setDateErrorMessage(null);
    executeDeliverHearingAids(
      {
        patientUuid: patient.uuid,
        deliveredAt: date,
        note: canWriteNote ? note.trim() || undefined : undefined,
      },
      {
        onSuccess: () => {
          releaseSaving();
          onDelivered();
        },
        onError: (error: Error) => {
          releaseSaving();
          // El 409 (ya entregados) salió como aviso y refrescó los datos: no hay nada que corregir aquí.
          if (isLabConflict(error)) onDelivered();
          else if (error instanceof ApiError && error.status === HttpStatus.BAD_REQUEST) {
            setDateErrorMessage(error.message);
          } else setErrorMessage(error.message);
        },
      },
    );
  };

  return {
    date,
    note,
    minDate: sentDay,
    maxDate: today,
    errorMessage,
    dateErrorMessage,
    canWriteNote,
    isSaving,
    isSaveDisabled: !date,
    handleDateChange,
    handleNoteChange,
    handleSave,
  };
}
