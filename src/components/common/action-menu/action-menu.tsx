import React from 'react';
import { Menu } from '@headlessui/react';
import { MoreHorizontal } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  /** Acción destructiva o de descarte: se pinta con el color de peligro. */
  isDanger?: boolean;
  onClick: () => void;
}

interface ActionMenuProps {
  ariaLabel: string;
  items: ActionMenuItem[];
  className?: string;
}

/** Botón "⋯" con las acciones poco frecuentes de un bloque. */
export const ActionMenu: React.FC<ActionMenuProps> = ({ ariaLabel, items, className }) => (
  <Menu as="div" className={tailwind('relative shrink-0', className)}>
    <Menu.Button
      aria-label={ariaLabel}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
    >
      <MoreHorizontal className="h-5 w-5" aria-hidden />
    </Menu.Button>

    {/* anchor posiciona el menú en un portal y lo mantiene dentro de la pantalla, aunque el botón quede pegado a un borde. */}
    <Menu.Items
      anchor="bottom end"
      transition
      className="z-50 w-max min-w-[12rem] origin-top-right rounded-lg border border-ink-200 bg-white py-1 shadow-lg transition duration-100 ease-out [--anchor-gap:4px] [--anchor-padding:8px] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
    >
        {items.map((item) => (
          <Menu.Item key={item.label}>
            {({ active }) => (
              <button
                type="button"
                onClick={item.onClick}
                className={tailwind(
                  'flex min-h-[44px] w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left text-sm',
                  item.isDanger ? 'text-danger' : 'text-ink-700',
                  active && (item.isDanger ? 'bg-danger/10' : 'bg-ink-50'),
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
  </Menu>
);
