import React from 'react';
import { Plus } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface SettingsAddButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Ayuda bajo el botón (por ejemplo, por qué está deshabilitado). */
  hint?: string;
}

/** Acción principal "Nuevo …" de las listas de Configuración: arriba a la derecha, a todo el ancho en el celular. */
export const SettingsAddButton: React.FC<SettingsAddButtonProps> = ({
  label,
  onClick,
  disabled,
  hint,
}) => {
  const button = (
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

  if (!hint) return button;

  return (
    <div className="flex flex-col gap-1.5 sm:items-end">
      {button}
      <Typography variant={TypographyVariant.HELPER} className="sm:text-right">
        {hint}
      </Typography>
    </div>
  );
};
