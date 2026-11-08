import React, { useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/common/badge/badge';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { StatusTone, STATUS_STYLES } from '@/shared/design/tokens';
import { variableToken } from '@/shared/utils/document-template-text';
import { TEXT } from '@/static/texts/i18n';
import {
  DOCUMENT_TEMPLATE_VARIABLES,
  DocumentTemplateVariable,
} from '@/types/document-templates/document-template';
import { tailwind } from '@/utils/tailwind-utils';

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
  // Debajo de `xl` el panel va al final de la pantalla y empieza cerrado; en `xl` siempre está abierto.
  const [isOpen, setIsOpen] = useState(false);
  const title = t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.TITLE, {
    total: DOCUMENT_TEMPLATE_VARIABLES.length,
  });

  return (
    <aside className="flex flex-col rounded-card border border-ink-200 bg-white xl:sticky xl:top-4 xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-card px-4 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand xl:hidden"
      >
        <Typography variant={TypographyVariant.BODY_SEMIBOLD}>{title}</Typography>
        <ChevronDown
          className={tailwind(
            'h-4 w-4 shrink-0 text-ink-500 transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="hidden px-4 pt-4 xl:block">
        {title}
      </Typography>

      <div className={tailwind('flex-col gap-3 p-4 pt-2 xl:flex', isOpen ? 'flex' : 'hidden')}>
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INTRO)}
        </Typography>

        <ul className="flex flex-col divide-y divide-ink-100">
          {DOCUMENT_TEMPLATE_VARIABLES.map((variable) => {
            const token = variableToken(variable);
            const insertLabel = t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INSERT, {
              variable: token,
            });
            return (
              <li key={variable} className="flex items-center justify-between gap-2 py-2">
                <div className="flex min-w-0 flex-col gap-1">
                  <Badge className={tailwind('font-mono', STATUS_STYLES[StatusTone.ACTIVE])}>
                    {token}
                  </Badge>
                  <Typography variant={TypographyVariant.HELPER}>
                    {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.WITH_EXAMPLE, {
                      description: t(itemKey(variable, 'description')),
                      example: t(itemKey(variable, 'example')),
                    })}
                  </Typography>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {usedVariables.has(variable) && (
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-success">
                      <Check className="h-3 w-3" aria-hidden />
                      {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.IN_USE)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onInsert(variable)}
                    aria-label={insertLabel}
                    title={insertLabel}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-ink-700 sm:h-10 sm:w-10 transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <Typography variant={TypographyVariant.HELPER} className="border-t border-ink-100 pt-3">
          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.FOOTER)}
        </Typography>
      </div>
    </aside>
  );
};
