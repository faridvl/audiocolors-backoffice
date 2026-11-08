import React from 'react';
import { fillVariables } from '@/shared/utils/document-template-text';
import {
  Block,
  BlockKind,
  parseBlocks,
  parseRuns,
  TextRun,
} from '@/shared/utils/document-template-markdown';
import { tailwind } from '@/utils/tailwind-utils';
import { SummaryTemplate } from './patient-summary-types';
import { SummarySectionTitle } from './summary-section-title';

const DEFAULT_HEADING_LEVEL = 1;
const HEADING_CLASSES: Record<number, string> = {
  1: 'text-xl font-bold text-ink-900',
  2: 'text-lg font-semibold text-ink-900',
  3: 'text-base font-semibold text-ink-800',
};

// Las variables se llenan sobre el texto ya separado en tramos: un valor del paciente con `*` o `~~`
// no se vuelve formato.
const Runs: React.FC<{ runs: TextRun[]; values: Record<string, string> }> = ({ runs, values }) => (
  <>
    {runs.map((run, index) => (
      <span
        key={index}
        className={tailwind(
          run.isBold && 'font-bold',
          run.isItalic && 'italic',
          run.isStruck && 'line-through',
        )}
      >
        {fillVariables(run.text, values)}
      </span>
    ))}
  </>
);

const BlockLine: React.FC<{ block: Block; values: Record<string, string> }> = ({
  block,
  values,
}) => {
  if (block.kind === BlockKind.BLANK) return <div className="h-3" aria-hidden />;
  const runs = (
    <Runs runs={parseRuns(block.text, block.kind === BlockKind.HEADING)} values={values} />
  );
  if (block.kind === BlockKind.HEADING) {
    return <h3 className={HEADING_CLASSES[block.level ?? DEFAULT_HEADING_LEVEL]}>{runs}</h3>;
  }
  if (block.kind === BlockKind.LIST_ITEM) {
    return (
      <p className="flex gap-2 pl-4 text-sm text-ink-800">
        <span className="shrink-0">{block.marker}</span>
        <span>{runs}</span>
      </p>
    );
  }
  return <p className="text-sm text-ink-800">{runs}</p>;
};

interface SummaryTemplateSectionProps {
  template: SummaryTemplate;
  /** Valor de cada variable de la plantilla, ya con los datos del paciente. */
  values: Record<string, string>;
}

export const SummaryTemplateSection: React.FC<SummaryTemplateSectionProps> = ({
  template,
  values,
}) => (
  <section data-print-summary-section="" className="flex flex-col gap-2">
    <SummarySectionTitle title={template.name} />
    <div className="flex flex-col gap-1">
      {parseBlocks(template.content).map((block, index) => (
        <BlockLine key={index} block={block} values={values} />
      ))}
    </div>
  </section>
);
