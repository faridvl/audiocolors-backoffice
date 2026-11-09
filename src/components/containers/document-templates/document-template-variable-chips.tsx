import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  DOCUMENT_TEMPLATE_VARIABLE_GROUPS,
  DocumentTemplateVariable,
  DocumentTemplateVariableGroup,
} from '@/types/document-templates/document-template';

interface DocumentTemplateVariableChipsProps {
  usedVariables: Set<string>;
  onInsert: (variable: DocumentTemplateVariable) => void;
}

const GROUPS = Object.values(DocumentTemplateVariableGroup);

const variableLabelKey = (variable: DocumentTemplateVariable) =>
  `${TEXT.DOCUMENT_TEMPLATES.VARIABLES.ITEM_PREFIX}.${variable}.label`;

/** Las variables agrupadas, una por chip; tocar una la pone donde está el cursor. */
export const DocumentTemplateVariableChips: React.FC<DocumentTemplateVariableChipsProps> = ({
  usedVariables,
  onInsert,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      {GROUPS.map((group) => (
        <section key={group} className="flex flex-col gap-2">
          <Typography variant={TypographyVariant.HELPER} className="font-medium">
            {t(`${TEXT.DOCUMENT_TEMPLATES.VARIABLES.GROUP_PREFIX}.${group}`)}
          </Typography>
          <ul className="grid grid-cols-2 gap-1.5">
            {DOCUMENT_TEMPLATE_VARIABLE_GROUPS[group].map((variable) => {
              const label = t(variableLabelKey(variable));
              return (
                <li key={variable} className="min-w-0">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onInsert(variable)}
                    title={t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INSERT, { variable: label })}
                    className="flex min-h-[40px] w-full min-w-0 items-center justify-between gap-1 rounded-md border border-ink-200 bg-white px-2 py-1 text-left text-xs leading-tight text-ink-700 transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand sm:min-h-8"
                  >
                    <span className="min-w-0 break-words">{label}</span>
                    {usedVariables.has(variable) && (
                      <>
                        <Check className="h-3 w-3 shrink-0 text-success" aria-hidden />
                        <span className="sr-only">
                          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.IN_USE)}
                        </span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};
