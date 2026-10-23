import React from 'react';
import { Loader2, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/shared/auth/permissions';
import { TEXT } from '@/static/texts/i18n';

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
}

/** Pantalla entera para un permiso: sin él, un aviso en vez del contenido (y sin pedir sus datos). */
export const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children }) => {
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
        <Typography variant={TypographyVariant.BODY}>{t(TEXT.GENERAL.FORBIDDEN)}</Typography>
      </div>
    );
  }

  return <>{children}</>;
};
