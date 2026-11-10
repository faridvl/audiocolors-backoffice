import React from 'react';
import Link from 'next/link';
import { Loader2, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ButtonVariant, buttonClasses } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/shared/auth/permissions';
import { routesPrivate } from '@/shared/navigation/routes';
import { TEXT } from '@/static/texts/i18n';

interface RequirePermissionProps {
  permission: Permission;
  /** Aviso sin permiso; por defecto el genérico de acceso. */
  message?: string;
  /** Destino y texto del botón sin permiso; por defecto, volver al inicio. */
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

/** Pantalla entera para un permiso: sin él, un aviso en vez del contenido (y sin pedir sus datos). */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  message,
  backHref,
  backLabel,
  children,
}) => {
  const { t } = useTranslation();
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
      </div>
    );
  }

  if (!can(permission)) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 py-12 text-center">
        <Lock className="h-8 w-8 text-ink-400" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>{message ?? t(TEXT.GENERAL.FORBIDDEN)}</Typography>
        <Link
          href={backHref ?? routesPrivate.patients.index}
          className={buttonClasses(ButtonVariant.SECONDARY, 'mt-2')}
        >
          {backLabel ?? t(TEXT.GENERAL.BACK_HOME)}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
