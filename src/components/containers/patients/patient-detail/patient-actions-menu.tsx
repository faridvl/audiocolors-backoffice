import React from 'react';
import { Menu } from '@headlessui/react';
import { Ear, MoreHorizontal, Pencil, UserCog } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

interface PatientActionsMenuProps {
  onEdit: () => void;
  onChangeStatus: () => void;
  onEditFlags: () => void;
}

/** Acciones poco frecuentes del paciente: en un menú para no competir con los datos. */
export const PatientActionsMenu: React.FC<PatientActionsMenuProps> = ({
  onEdit,
  onChangeStatus,
  onEditFlags,
}) => {
  const { t } = useTranslation();
  const items = [
    { label: t(TEXT.PATIENTS.DETAIL.ACTIONS.EDIT), icon: Pencil, onClick: onEdit },
    {
      label: t(TEXT.PATIENTS.DETAIL.ACTIONS.CHANGE_STATUS),
      icon: UserCog,
      onClick: onChangeStatus,
    },
    { label: t(TEXT.PATIENTS.FLAGS.MENU), icon: Ear, onClick: onEditFlags },
  ];

  return (
    <Menu as="div" className="relative shrink-0">
      <Menu.Button
        aria-label={t(TEXT.PATIENTS.DETAIL.ACTIONS.MORE)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </Menu.Button>
      <Menu.Items className="absolute right-0 z-20 mt-1 w-52 origin-top-right rounded-lg border border-ink-200 bg-white py-1 shadow-lg focus:outline-none">
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
                <item.icon className="h-4 w-4 text-ink-500" aria-hidden />
                {item.label}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};
