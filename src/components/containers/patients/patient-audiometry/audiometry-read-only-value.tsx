import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface ReadOnlyValueProps {
  value: string | number | null | undefined;
  className?: string;
}

/** Un dato de una audiometría guardada: texto plano, o "Sin registrar" si no hay nada. */
export const ReadOnlyValue: React.FC<ReadOnlyValueProps> = ({ value, className }) => {
  const { t } = useTranslation();
  const isEmpty = value === null || value === undefined || String(value).trim() === '';

  return (
    <span className={tailwind(className, isEmpty && 'text-ink-500')}>
      {isEmpty ? t(TEXT.GENERAL.NOT_RECORDED) : value}
    </span>
  );
};
