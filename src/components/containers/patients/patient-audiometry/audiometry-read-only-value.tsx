import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { SummaryEditableText } from '../patient-summary/summary-editable-text';

interface ReadOnlyValueProps {
  value: string | number | null | undefined;
  className?: string;
  /** Dentro de la vista previa del resumen el texto se puede corregir a mano. */
  isCorrectable?: boolean;
}

/** Un dato de una audiometría guardada: texto plano, o "Sin registrar" si no hay nada. */
export const ReadOnlyValue: React.FC<ReadOnlyValueProps> = ({
  value,
  className,
  isCorrectable = false,
}) => {
  const { t } = useTranslation();
  const isEmpty = value === null || value === undefined || String(value).trim() === '';

  const classes = tailwind(className, isEmpty && 'text-ink-500');
  const content = isEmpty ? t(TEXT.GENERAL.NOT_RECORDED) : value;
  if (isCorrectable)
    return <SummaryEditableText className={classes}>{content}</SummaryEditableText>;
  return <span className={classes}>{content}</span>;
};
