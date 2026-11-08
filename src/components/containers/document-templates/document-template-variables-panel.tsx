import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { DocumentTemplateVariable } from '@/types/document-templates/document-template';
import { DocumentTemplateVariableChips } from './document-template-variable-chips';

interface DocumentTemplateVariablesPanelProps {
  usedVariables: Set<string>;
  onInsert: (variable: DocumentTemplateVariable) => void;
}

/** Columna de variables junto a la hoja; debajo de `xl` se insertan desde el menú de la barra de formato. */
export const DocumentTemplateVariablesPanel: React.FC<DocumentTemplateVariablesPanelProps> = ({
  usedVariables,
  onInsert,
}) => {
  const { t } = useTranslation();

  return (
    <aside className="hidden flex-col gap-4 rounded-card bg-ink-50 p-4 xl:sticky xl:top-4 xl:flex xl:max-h-[calc(100dvh-8rem)] xl:overflow-y-auto">
      <div className="flex flex-col gap-0.5">
        <Typography variant={TypographyVariant.BODY} className="font-medium text-ink-700">
          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.TITLE)}
        </Typography>
        <Typography variant={TypographyVariant.HELPER} className="text-sm">
          {t(TEXT.DOCUMENT_TEMPLATES.VARIABLES.INTRO)}
        </Typography>
      </div>
      <DocumentTemplateVariableChips usedVariables={usedVariables} onInsert={onInsert} />
    </aside>
  );
};
