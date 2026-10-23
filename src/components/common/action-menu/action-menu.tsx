import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreHorizontal } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
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
      className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
    >
      <MoreHorizontal className="h-5 w-5" aria-hidden />
    </Menu.Button>

    <Transition
      as={React.Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="absolute right-0 z-20 mt-1 w-48 origin-top-right rounded-lg border border-ink-200 bg-white py-1 shadow-lg focus:outline-none">
        {items.map((item) => (
          <Menu.Item key={item.label}>
            {({ active }) => (
              <button
                type="button"
                onClick={item.onClick}
                className={tailwind(
                  'flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700',
                  active && 'bg-ink-50',
                )}
              >
                {item.icon}
                {item.label}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Transition>
  </Menu>
);
