import React, { createContext, useContext } from 'react';
import { tailwind } from '@/utils/tailwind-utils';

/** Solo la vista previa del resumen lo enciende: fuera de ella los textos son de solo lectura. */
export const SummaryEditableContext = createContext(false);

type EditableTag = 'span' | 'p' | 'dd' | 'h3';

// El resaltado es solo de pantalla; globals.css lo quita al imprimir.
const EDITABLE_CLASSES =
  'cursor-text rounded-sm outline-none transition-colors hover:bg-brand/5 focus:bg-brand/10 focus:ring-1 focus:ring-brand/40';

interface SummaryEditableTextProps {
  as?: EditableTag;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Texto corregible a mano en la vista previa. Edita el DOM directamente y no guarda nada:
 * por eso la vista no se vuelve a pintar con datos nuevos mientras está abierta.
 */
export const SummaryEditableText: React.FC<SummaryEditableTextProps> = ({
  as: Tag = 'span',
  className,
  children,
}) => {
  const isEditable = useContext(SummaryEditableContext);
  if (!isEditable) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      data-summary-editable=""
      className={tailwind(className, EDITABLE_CLASSES)}
    >
      {children}
    </Tag>
  );
};
