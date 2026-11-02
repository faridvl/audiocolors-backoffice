import { useRef, useState } from 'react';
import { useDeliverHearingAidsMutation } from '@/shared/api/mutations/patients/deliver-hearing-aids-mutation';
import { toClinicDayKey } from '@/shared/utils/dates';
import { Patient } from '@/types/patients/patient';
import { LAB_DELIVERY_NOTE_MAX_LENGTH } from '@/types/patients/patient-lab-shipment';

interface UseLabDeliveryFormOptions {
  patient: Patient;
  onDelivered: () => void;
}

/**
 * Entrega de los audífonos: fecha (hoy por defecto) y nota opcional. Las fechas fuera de rango
 * las rechaza el API y su mensaje se muestra junto al formulario, que sigue abierto.
 */
export function useLabDeliveryForm({ patient, onDelivered }: UseLabDeliveryFormOptions) {
  const { executeDeliverHearingAids } = useDeliverHearingAidsMutation();
  const today = toClinicDayKey(new Date().toISOString());
  const sentDay = patient.hearingAidsInLabSince
    ? toClinicDayKey(patient.hearingAidsInLabSince)
    : undefined;
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // El ref corta el segundo clic del mismo instante, antes de que el estado se repinte.
  const savingRef = useRef(false);

  const releaseSaving = () => {
    savingRef.current = false;
    setIsSaving(false);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setErrorMessage(null);
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
    executeDeliverHearingAids(
      {
        patientUuid: patient.uuid,
        deliveredAt: date,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          releaseSaving();
          onDelivered();
        },
        onError: (error: Error) => {
          releaseSaving();
          setErrorMessage(error.message);
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
    isSaving,
    isSaveDisabled: !date,
    handleDateChange,
    handleNoteChange,
    handleSave,
  };
}
