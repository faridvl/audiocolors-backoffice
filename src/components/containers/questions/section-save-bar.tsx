import React from 'react';
import { createPortal } from 'react-dom';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { tailwind } from '@/utils/tailwind-utils';

interface SectionSaveBarProps {
  /**
   * Nodo fuera de la tarjeta donde se dibuja la barra. Sin él, la barra queda al pie del
   * formulario, dentro de lo que lo contiene.
   */
  slot?: HTMLElement | null;
  /** Qué guarda esta barra (a la izquierda, desde `sm`). */
  label?: string;
  hint?: string;
  children: React.ReactNode;
}

/** La barra fija de Guardar de una sección de Formularios. */
export const SectionSaveBar: React.FC<SectionSaveBarProps> = ({ slot, label, hint, children }) => {
  const hasSlot = !!slot;
  const bar = (
    <div
      className={tailwind(
        'z-10 flex flex-col gap-2 bg-white',
        hasSlot
          ? 'rounded-card border border-ink-200 p-3 shadow-[0_-6px_8px_-6px] shadow-ink-900/10 sm:px-5'
          : 'sticky bottom-0 border-t border-ink-100 py-3 shadow-[0_-6px_8px_-6px] shadow-ink-900/10',
      )}
    >
      {hint && (
        <Typography variant={TypographyVariant.HELPER} className="hidden sm:block">
          {hint}
        </Typography>
      )}
      <div className="flex items-center justify-end gap-3">
        {hasSlot && label && (
          <Typography
            variant={TypographyVariant.HELPER}
            className="mr-auto hidden min-w-0 truncate sm:block"
          >
            {label}
          </Typography>
        )}
        {children}
      </div>
    </div>
  );

  return slot ? createPortal(bar, slot) : bar;
};
