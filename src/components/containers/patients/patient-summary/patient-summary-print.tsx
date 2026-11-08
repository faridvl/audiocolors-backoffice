import React from 'react';
import { tailwind } from '@/utils/tailwind-utils';
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
  /** Con la ficha técnica apagada, la hoja lleva solo logo, título y firma. */
  showPatientSheet: boolean;
  /** Plantillas elegidas; vacío si no se eligió ninguna. */
  templates: SummaryTemplate[];
  /** Valor de cada variable de las plantillas, con los datos del paciente. */
  templateValues: Record<string, string>;
  background: SummaryBackground | null;
  otoscopy: SummaryOtoscopy | null;
  /** Una por cada audiometría elegida, de la más antigua a la más nueva. */
  audiometries: SummaryAudiometry[];
}

const SHEET_BREAK_CLASSES = 'break-before-page';
// La última sección no suelta su cierre: la firma nunca queda sola en una hoja.
const KEEP_WITH_SIGNATURE_CLASSES = 'break-after-avoid';
// En pantalla cada hoja es una A4 con su margen; al imprimir el margen lo pone el body.
const SHEET_CLASSES =
  'flex w-[210mm] min-h-[297mm] shrink-0 flex-col gap-4 bg-white p-[12mm] shadow-md print:min-h-0 print:w-auto print:p-0 print:shadow-none';

/**
 * El resumen armado como hojas A4: lo que se ve en la vista previa es lo que sale al imprimir.
 * Va memoizado para que un re-render del padre no pise lo que el usuario corrigió a mano.
 */
export const PatientSummaryPrint: React.FC<PatientSummaryPrintProps> = React.memo(
  ({
    tenant,
    summaryPatient,
    issuedAt,
    professionalName,
    showPatientSheet,
    templates,
    templateValues,
    background,
    otoscopy,
    audiometries,
  }) => {
    const sections: { key: string; node: React.ReactNode }[] = [
      ...templates.map((template) => ({
        key: `template-${template.uuid}`,
        node: <SummaryTemplateSection template={template} values={templateValues} />,
      })),
      ...(background
        ? [
            {
              key: 'background',
              node: <SummaryClinicalHistorySection summaryBackground={background} />,
            },
          ]
        : []),
      ...audiometries.map((audiometry, index) => ({
        key: `audiometry-${index}`,
        node: <SummaryAudiometrySection audiometry={audiometry} />,
      })),
      ...(otoscopy ? [{ key: 'otoscopy', node: <SummaryOtoscopySection entry={otoscopy} /> }] : []),
    ];
    const header = (
      <SummaryHeader
        tenant={tenant}
        summaryPatient={summaryPatient}
        issuedAt={issuedAt}
        showPatientSheet={showPatientSheet}
      />
    );
    const signature = <SummarySignature professionalName={professionalName} />;

    return (
      <div
        data-print-summary=""
        className="flex flex-col items-center gap-4 text-ink-700 print:block print:gap-0"
      >
        {sections.length === 0 && (
          <div className={SHEET_CLASSES}>
            {header}
            {signature}
          </div>
        )}
        {sections.map((section, index) => {
          const isLast = index === sections.length - 1;
          return (
            <div
              key={section.key}
              className={tailwind(SHEET_CLASSES, index > 0 && SHEET_BREAK_CLASSES)}
            >
              {index === 0 && header}
              <div className={tailwind(isLast && KEEP_WITH_SIGNATURE_CLASSES)}>{section.node}</div>
              {isLast && signature}
            </div>
          );
        })}
      </div>
    );
  },
);
PatientSummaryPrint.displayName = 'PatientSummaryPrint';
