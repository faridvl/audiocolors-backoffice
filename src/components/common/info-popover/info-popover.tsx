import React from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Info } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

interface InfoPopoverProps {
  ariaLabel: string;
  /** Contenido del panel; se abre al tocar el botón y se cierra con Escape o al tocar afuera. */
  children: React.ReactNode;
  className?: string;
}

const PANEL_GAP_PX = 6;
const PANEL_VIEWPORT_PADDING_PX = 12;

/** Botón de info que abre un panel flotante con una explicación corta. */
export const InfoPopover: React.FC<InfoPopoverProps> = ({ ariaLabel, children, className }) => (
  <Popover className={tailwind('relative shrink-0', className)}>
    <PopoverButton
      aria-label={ariaLabel}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand data-[open]:bg-ink-100 data-[open]:text-ink-800"
    >
      <Info className="h-5 w-5" aria-hidden />
    </PopoverButton>

    <PopoverPanel
      anchor={{ to: 'bottom start', gap: PANEL_GAP_PX, padding: PANEL_VIEWPORT_PADDING_PX }}
      className="z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-card border border-ink-200 bg-white p-3 text-sm text-ink-700 shadow-lg focus:outline-none"
    >
      {children}
    </PopoverPanel>
  </Popover>
);
