import React from 'react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useBackdropClose } from '@/hooks/use-backdrop-close';
import { useEscapeKey } from '@/hooks/use-escape-key';

interface UserModalShellProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

/** Ventana de los formularios de usuarios; en el celular sube desde abajo, como las demás. */
export const UserModalShell: React.FC<UserModalShellProps> = ({
  title,
  icon,
  onClose,
  children,
}) => {
  useEscapeKey(onClose);
  const backdropProps = useBackdropClose(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      {...backdropProps}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            {icon}
          </span>
          <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
        </div>
        {children}
      </div>
    </div>
  );
};
