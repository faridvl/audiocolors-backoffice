import React from 'react';
import { ButtonVariant, buttonClasses } from './button';

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

/**
 * Enlace con forma de botón, para lo que abre una dirección (un `webcal://`,
 * un archivo) en vez de ejecutar una acción. Mismo estilo que `Button`.
 */
export const ButtonLink: React.FC<ButtonLinkProps> = ({
  variant = ButtonVariant.PRIMARY,
  icon,
  children,
  className,
  ...rest
}) => (
  <a className={buttonClasses(variant, className)} {...rest}>
    {icon}
    {children}
  </a>
);
