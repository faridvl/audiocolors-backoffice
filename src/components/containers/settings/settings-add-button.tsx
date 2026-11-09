import React from 'react';
import { Plus } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';

interface SettingsAddButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Acción principal "Nuevo …" de las listas de Configuración: arriba a la derecha, a todo el ancho en el celular. */
export const SettingsAddButton: React.FC<SettingsAddButtonProps> = ({
  label,
  onClick,
  disabled,
}) => (
  <Button
    variant={ButtonVariant.PRIMARY}
    onClick={onClick}
    disabled={disabled}
    icon={<Plus className="h-4 w-4" aria-hidden />}
    className="w-full sm:w-auto sm:self-end"
  >
    {label}
  </Button>
);
