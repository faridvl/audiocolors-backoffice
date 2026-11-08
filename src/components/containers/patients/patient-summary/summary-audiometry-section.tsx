import React from 'react';
import { AudiometryPrintReport } from '../patient-audiometry/audiometry-print-report';
import { SummaryAudiometry } from './patient-summary-types';

interface SummaryAudiometrySectionProps {
  audiometry: SummaryAudiometry;
}

export const SummaryAudiometrySection: React.FC<SummaryAudiometrySectionProps> = ({
  audiometry,
}) => <AudiometryPrintReport {...audiometry} isEmbedded />;
