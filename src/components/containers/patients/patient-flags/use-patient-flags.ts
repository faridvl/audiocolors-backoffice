import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUpdatePatientFlagMutation } from '@/shared/api/mutations/patients/update-patient-flag-mutation';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import { FETCH_PATIENTS_KEY } from '@/shared/api/querys/patients-query';
import { FETCH_PATIENT_ACTIVITY_KEY } from '@/shared/api/querys/patient-activity-query';
import { toDayKey } from '@/shared/utils/dates';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { Patient, PATIENT_FLAG_SINCE_FIELDS, PatientFlag } from '@/types/patients/patient';

export interface PatientFlagItem {
  flag: PatientFlag;
  label: string;
  isOn: boolean;
  isUpdating: boolean;
  /** Texto bajo el label (audífonos: "Enviados el 28 oct 2026"). */
  description?: string;
}

/** Secciones del modal de indicadores. Candidato a video va aparte, como casilla en el expediente. */
export enum PatientFlagSection {
  LAB = 'lab',
  WARRANTY = 'warranty',
  MAINTENANCE = 'maintenance',
}

const SECTION_FLAGS: Record<PatientFlagSection, PatientFlag[]> = {
  [PatientFlagSection.LAB]: [PatientFlag.HEARING_AIDS_IN_LAB],
  [PatientFlagSection.WARRANTY]: [
    PatientFlag.ACTIVE_WARRANTY,
    PatientFlag.WARRANTY_EXPIRED,
    PatientFlag.RENEW_PRESCRIPTION,
  ],
  [PatientFlagSection.MAINTENANCE]: [],
};

export function usePatientFlags(
  patient: Patient,
  initialSection: PatientFlagSection = PatientFlagSection.LAB,
) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { executeUpdatePatientFlag } = useUpdatePatientFlagMutation();
  const [updatingFlag, setUpdatingFlag] = useState<PatientFlag | null>(null);
  const [activeSection, setActiveSection] = useState(initialSection);
  // Fecha de envío en edición (null = el campo está cerrado): al prender los audífonos no se
  // guarda hasta confirmarla.
  const [shipmentDate, setShipmentDate] = useState<string | null>(null);
  const today = toDayKey(new Date());
  const isLabOn = Boolean(patient.hearingAidsInLabSince);

  // El API guarda desde cuándo está prendido, pero solo importa si lo está.
  const buildItem = (flag: PatientFlag): PatientFlagItem => {
    const isLab = flag === PatientFlag.HEARING_AIDS_IN_LAB;
    const since = patient[PATIENT_FLAG_SINCE_FIELDS[flag]];
    return {
      flag,
      label: t(`${TEXT.PATIENTS.FLAGS.LABEL_PREFIX}.${flag}`),
      // Mientras se elige la fecha el switch ya se ve prendido.
      isOn: Boolean(since) || (isLab && shipmentDate !== null),
      isUpdating: updatingFlag === flag,
      description:
        isLab && since && shipmentDate === null
          ? t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.SHIPPED_ON, { date: formatDate(since) })
          : undefined,
    };
  };

  const sections = Object.values(PatientFlagSection).map((section) => ({
    key: section,
    title: t(`${TEXT.PATIENTS.FLAGS.SECTION_PREFIX}.${section}`),
    flags: SECTION_FLAGS[section].map(buildItem),
  }));
  const videoCandidate = buildItem(PatientFlag.VIDEO_CANDIDATE);

  const handleToggle = (flag: PatientFlag, isOn: boolean) => {
    if (flag === PatientFlag.HEARING_AIDS_IN_LAB) {
      if (isOn) {
        setShipmentDate(today);
        return;
      }
      setShipmentDate(null);
      // Cancelar al prender: el indicador nunca llegó a guardarse.
      if (!isLabOn) return;
    }
    saveFlag(flag, isOn);
  };

  const handleStartDateChange = () => {
    setShipmentDate(
      patient.hearingAidsInLabSince ? toDayKey(new Date(patient.hearingAidsInLabSince)) : today,
    );
  };

  // La fecha abierta es de Laboratorio: al cambiar de pestaña se descarta.
  const handleSectionChange = (section: PatientFlagSection) => {
    setActiveSection(section);
    setShipmentDate(null);
  };

  const handleSaveShipmentDate = () => {
    if (shipmentDate) saveFlag(PatientFlag.HEARING_AIDS_IN_LAB, true, shipmentDate);
  };

  const saveFlag = (flag: PatientFlag, isOn: boolean, date?: string) => {
    setUpdatingFlag(flag);
    executeUpdatePatientFlag(
      { patientUuid: patient.uuid, flag, isOn, date },
      {
        onSuccess: (updated) => {
          setShipmentDate(null);
          const field = PATIENT_FLAG_SINCE_FIELDS[flag];
          queryClient.setQueryData([FETCH_PATIENT_KEY, patient.uuid], (previous?: Patient) =>
            previous ? { ...previous, [field]: updated[field] ?? null } : previous,
          );
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENTS_KEY] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
          const prefix = isOn
            ? TEXT.PATIENTS.FLAGS.TOAST_ON_PREFIX
            : TEXT.PATIENTS.FLAGS.TOAST_OFF_PREFIX;
          toast.success(
            isOn && isLabOn && flag === PatientFlag.HEARING_AIDS_IN_LAB
              ? t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.DATE_UPDATED)
              : t(`${prefix}.${flag}`),
          );
        },
        onError: (error: Error) => toast.error(error.message),
        onSettled: () => setUpdatingFlag(null),
      },
    );
  };

  return {
    sections,
    activeSection,
    activeFlags: sections.find((section) => section.key === activeSection)?.flags ?? [],
    videoCandidate,
    handleToggle,
    labShipment: {
      isEditing: shipmentDate !== null,
      isLabOn,
      date: shipmentDate ?? today,
      maxDate: today,
      isSaving: updatingFlag === PatientFlag.HEARING_AIDS_IN_LAB,
      isSaveDisabled: !shipmentDate || shipmentDate > today,
      handleDateChange: setShipmentDate,
      handleStartDateChange,
      handleSave: handleSaveShipmentDate,
      handleCancel: () => setShipmentDate(null),
    },
    isWarrantySection: activeSection === PatientFlagSection.WARRANTY,
    isMaintenanceSection: activeSection === PatientFlagSection.MAINTENANCE,
    handleSectionChange,
  };
}
