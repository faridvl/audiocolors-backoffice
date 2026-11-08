import React from 'react';
import { Check, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/common/badge/badge';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { variableToken } from '@/shared/utils/document-template-text';
import { TEXT } from '@/static/texts/i18n';
import {
  DOCUMENT_TEMPLATE_VARIABLES,
  DocumentTemplateVariable,
} from '@/types/document-templates/document-template';

interface DocumentTemplateVariablesPanelProps {
  usedVariables: Set<string>;
  onInsert: (variable: DocumentTemplateVariable) => void;
}

const itemKey = (variable: DocumentTemplateVariable, part: 'description' | 'example') =>
  `${TEXT.DOCUMENT_TEMPLATES.VARIABLES.ITEM_PREFIX}.${variable}.${part}`;

/** Las variables que el sistema reemplaza; el "+" pone la elegida donde está el cursor. */
export const DocumentTemplateVariablesPanel: React.FC<DocumentTemplateVariablesPanelProps> = ({
  usedVariables,
  onInsert,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="flex flex-col gap-3 rounded-card border border-ink-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.TITLE)}
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INTRO)}
        </Typography>
      </div>

      <ul className="flex flex-col divide-y divide-ink-100">
        {DOCUMENT_TEMPLATE_VARIABLES.map((variable) => {
          const token = variableToken(variable);
          const insertLabel = t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INSERT, { variable: token });
          return (
            <li key={variable} className="flex items-center justify-between gap-2 py-2">
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="font-mono">{token}</Badge>
                  {usedVariables.has(variable) && (
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-brand-700">
                      <Check className="h-3 w-3" aria-hidden />
                      {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.IN_USE)}
                    </span>
                  )}
                </div>
                <Typography variant={TypographyVariant.HELPER}>
                  {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.WITH_EXAMPLE, {
                    description: t(itemKey(variable, 'description')),
                    example: t(itemKey(variable, 'example')),
                  })}
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => onInsert(variable)}
                aria-label={insertLabel}
                title={insertLabel}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-700 transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>

      <Typography variant={TypographyVariant.HELPER} className="border-t border-ink-100 pt-3">
        {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.FOOTER)}
      </Typography>
    </aside>
  );
};
