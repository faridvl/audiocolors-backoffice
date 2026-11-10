import React from 'react';
import { ClinicBrand } from './clinic-brand';

const PRINT_LOGO_HEIGHT_PX = 40;

interface PrintDocumentTitleBarProps {
  logoUrl?: string | null;
  clinicName?: string | null;
  title: string;
}

/**
 * Banda superior de los documentos impresos: marca de la clínica y título. El nombre solo se
 * escribe cuando no hay logo (ClinicBrand), para no repetir lo que el logo ya dice.
 */
export const PrintDocumentTitleBar: React.FC<PrintDocumentTitleBarProps> = ({
  logoUrl,
  clinicName,
  title,
}) => (
  <div className="flex items-start justify-between gap-4 border-b-2 border-ink-300 pb-2">
    <ClinicBrand logoUrl={logoUrl} name={clinicName} height={PRINT_LOGO_HEIGHT_PX} />
    <h1 className="text-right text-xl font-semibold text-ink-900">{title}</h1>
  </div>
);
