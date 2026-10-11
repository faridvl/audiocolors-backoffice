import React from 'react';
import { Checkbox } from '@/components/common/checkbox/checkbox';
import { Patient } from '@/types/patients/patient';
import { usePatientFlags } from './use-patient-flags';

/** Candidato a video se marca directo en el expediente: guarda al tocarlo. */
export const VideoCandidateCheck: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { videoCandidate, handleToggle } = usePatientFlags(patient);

  return (
    <Checkbox
      isChecked={videoCandidate.isOn}
      onChange={(isOn) => handleToggle(videoCandidate.flag, isOn)}
      label={videoCandidate.label}
      isLoading={videoCandidate.isUpdating}
    />
  );
};
