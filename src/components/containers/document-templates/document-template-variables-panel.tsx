import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import {
  DOCUMENT_TEMPLATE_VARIABLES,
  DOCUMENT_TEMPLATE_VARIABLE_GROUPS,
  DocumentTemplateVariable,
  DocumentTemplateVariableGroup,
} from '@/types/document-templates/document-template';
import { tailwind } from '@/utils/tailwind-utils';

interface DocumentTemplateVariablesPanelProps {
  usedVariables: Set<string>;
  onInsert: (variable: DocumentTemplateVariable) => void;
}

const GROUPS = Object.values(DocumentTemplateVariableGroup);

const variableLabelKey = (variable: DocumentTemplateVariable) =>
  `${TEXT.DOCUMENT_TEMPLATES.VARIABLES.ITEM_PREFIX}.${variable}.label`;

/** Las variables que el sistema reemplaza; tocar una la pone donde está el cursor. */
export const DocumentTemplateVariablesPanel: React.FC<DocumentTemplateVariablesPanelProps> = ({
  usedVariables,
  onInsert,
}) => {
  const { t } = useTranslation();
  // Debajo de `xl` el panel va sobre la hoja y empieza cerrado; en `xl` siempre está abierto.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="order-first flex flex-col rounded-card border border-ink-200 bg-white xl:sticky xl:top-4 xl:order-none xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-card px-4 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand xl:hidden"
      >
        <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.TITLE_WITH_TOTAL, {
            total: DOCUMENT_TEMPLATE_VARIABLES.length,
          })}
        </Typography>
        <ChevronDown
          className={tailwind(
            'h-4 w-4 shrink-0 text-ink-500 transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <div
        className={tailwind('flex-col gap-4 px-4 pb-4 xl:flex xl:pt-4', isOpen ? 'flex' : 'hidden')}
      >
        <div className="flex flex-col gap-0.5">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="hidden xl:block">
            {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.TITLE)}
          </Typography>
          <Typography variant={TypographyVariant.HELPER}>
            {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INTRO)}
          </Typography>
        </div>

        {GROUPS.map((group) => (
          <section key={group} className="flex flex-col gap-2">
            <Typography
              variant={TypographyVariant.HELPER}
              className="font-semibold uppercase tracking-wide"
            >
              {t(`${TEXT.DOCUMENT_TEMPLATES.VARIABLES.GROUP_PREFIX}.${group}`)}
            </Typography>
            <ul className="flex flex-wrap gap-1.5">
              {DOCUMENT_TEMPLATE_VARIABLE_GROUPS[group].map((variable) => {
                const label = t(variableLabelKey(variable));
                return (
                  <li key={variable}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onInsert(variable)}
                      title={t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INSERT, {
                        variable: label,
                      })}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-700 transition-colors hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand sm:min-h-8 sm:px-2.5"
                    >
                      {label}
                      {usedVariables.has(variable) && (
                        <>
                          <Check className="h-3.5 w-3.5 text-success" aria-hidden />
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
    </aside>
  );
};
