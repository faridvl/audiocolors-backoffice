import React from 'react';
import {
  SummaryAudiometry,
  SummaryBackground,
  SummaryOtoscopy,
  SummaryPatient,
  SummaryTemplate,
  SummaryTenant,
} from './patient-summary-types';
import { SummaryAudiometrySection } from './summary-audiometry-section';
import { SummaryClinicalHistorySection } from './summary-clinical-history-section';
import { SummaryHeader } from './summary-header';
import { SummaryOtoscopySection } from './summary-otoscopy-section';
import { SummarySignature } from './summary-signature';
import { SummaryTemplateSection } from './summary-template-section';

export interface PatientSummaryPrintProps {
  tenant: SummaryTenant;
  summaryPatient: SummaryPatient;
  /** Fecha de emisión (ISO). */
  issuedAt: string;
  /** Nombre completo del usuario con sesión: va bajo la firma. */
  professionalName: string;
  /** Plantillas elegidas, ya llenadas; vacío si no se eligió ninguna. */
  templates: SummaryTemplate[];
  background: SummaryBackground | null;
  otoscopy: SummaryOtoscopy | null;
  audiometry: SummaryAudiometry | null;
}

const SECTION_BREAK_CLASSES = 'break-before-page';

/** Solo se ve al imprimir: logo y ficha, las secciones elegidas (cada una en su hoja) y una firma. */
export const PatientSummaryPrint: React.FC<PatientSummaryPrintProps> = ({
  tenant,
  summaryPatient,
  issuedAt,
  professionalName,
  templates,
  background,
  otoscopy,
  audiometry,
}) => {
  const sections: { key: string; node: React.ReactNode }[] = [
    ...templates.map((template) => ({
      key: `template-${template.uuid}`,
      node: <SummaryTemplateSection template={template} />,
    })),
    ...(background
      ? [
          {
            key: 'background',
            node: <SummaryClinicalHistorySection summaryBackground={background} />,
          },
        ]
      : []),
    ...(otoscopy ? [{ key: 'otoscopy', node: <SummaryOtoscopySection entry={otoscopy} /> }] : []),
    ...(audiometry
      ? [{ key: 'audiometry', node: <SummaryAudiometrySection audiometry={audiometry} /> }]
      : []),
  ];

  return (
    <div data-print-summary="" className="hidden flex-col gap-4 bg-white text-ink-700 print:flex">
      <SummaryHeader tenant={tenant} summaryPatient={summaryPatient} issuedAt={issuedAt} />
      {sections.map((section, index) => (
        <div key={section.key} className={index > 0 ? SECTION_BREAK_CLASSES : undefined}>
          {section.node}
        </div>
      ))}
      <SummarySignature professionalName={professionalName} />
    </div>
  );
};
