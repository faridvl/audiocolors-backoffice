import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import { Users, LogOut, ChevronDown, ArrowLeft } from 'lucide-react';
import { routesPrivate } from '@/shared/navigation/routes';
import { useSession } from '@/hooks/use-session';
import { useLogout } from '@/hooks/use-logout';
import { tailwind } from '@/utils/tailwind-utils';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

const NAVIGATION = [{ label: 'Pacientes', href: routesPrivate.patients.index, icon: Users }];

function getInitials(fullName?: string): string {
  if (!fullName) return 'AC';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const UserMenu: React.FC = () => {
  const { user, tenant } = useSession();
  const logout = useLogout();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {getInitials(user?.fullName)}
        </span>
        <span className="hidden text-left sm:flex sm:flex-col">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
            {user?.fullName ?? 'Cargando...'}
          </Typography>
          <Typography variant={TypographyVariant.HELPER}>{tenant?.businessName ?? ''}</Typography>
        </span>
        <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden />
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
        <Menu.Items className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-ink-200 bg-white py-1 shadow-lg focus:outline-none">
          <div className="border-b border-ink-100 px-3 py-2 sm:hidden">
            <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="truncate">
              {user?.fullName ?? 'Cargando...'}
            </Typography>
            <Typography variant={TypographyVariant.HELPER} className="truncate">
              {tenant?.businessName ?? ''}
            </Typography>
          </div>

          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                onClick={logout}
                className={tailwind(
                  'flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700',
                  active && 'bg-ink-50',
                )}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Cerrar sesión
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

interface AppLayoutProps {
  title: string;
  /**
   * Ruta de regreso. Cuando se pasa, el header muestra un chevron a la
   * izquierda del titulo en vez de gastar una fila del contenido en un
   * enlace "volver".
   */
  backHref?: string;
  /** Texto secundario junto al titulo (p.ej. el nombre de la seccion). */
  subtitle?: string;
  /**
   * Accion principal del registro (p.ej. "Editar"). Vive en el header, no en
   * el contenido, para que en movil no compita con los datos por el ancho.
   */
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  title,
  backHref,
  subtitle,
  action,
  children,
}) => {
  const router = useRouter();

  const isActiveRoute = (href: string) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`);

  return (
    <div className="flex h-[100dvh] bg-ink-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200 bg-white px-3 py-5 md:flex">
        <div className="flex flex-col items-center border-b border-ink-100 px-2 pb-5">
          <BrandLogo height={42} priority />
          <Typography
            variant={TypographyVariant.HELPER}
            className="mt-1.5 block uppercase tracking-[0.18em] text-ink-400"
          >
            Gestión Clínica
          </Typography>
        </div>

        <nav className="mt-5 flex flex-col gap-1">
          {NAVIGATION.map((item) => {
            const isActive = isActiveRoute(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={tailwind(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between gap-4 border-b border-ink-200 bg-white px-4 py-3 md:px-6"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="flex min-w-0 items-center gap-1 md:gap-2">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="Volver"
                className="-ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-500 transition-colors hover:text-ink-800"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <BrandLogo height={28} className="shrink-0 md:hidden" />
            )}

            <div className="flex min-w-0 flex-col">
              <Typography
                variant={TypographyVariant.HEADER}
                className={tailwind('truncate text-lg md:text-2xl', !backHref && 'hidden md:block')}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant={TypographyVariant.HELPER} className="truncate">
                  {subtitle}
                </Typography>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 md:gap-2">
            {action}
            <UserMenu />
          </div>
        </header>

        <main
          className={tailwind(
            'flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-5 md:px-6',
            'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6',
          )}
        >
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-ink-200 bg-white md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAVIGATION.map((item) => {
          const isActive = isActiveRoute(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={tailwind(
                'flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium',
                isActive ? 'text-brand-600' : 'text-ink-500',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
