import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import { Users, LogOut, ChevronDown } from 'lucide-react';
import { routesPrivate } from '@/shared/navigation/routes';
import { useSession } from '@/hooks/use-session';
import { useLogout } from '@/hooks/use-logout';
import { tailwind } from '@/utils/tailwind-utils';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

const NAVIGATION = [
  { label: 'Pacientes', href: routesPrivate.patients.index, icon: Users },
];

function getInitials(fullName?: string): string {
  if (!fullName) return 'AC';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const BrandMark: React.FC = () => (
  <div className="flex flex-col">
    <BrandLogo className="text-xl" onDark />
    <Typography variant={TypographyVariant.CAPTION} className="mt-0.5 uppercase tracking-widest text-navy-400">
      Expedientes
    </Typography>
  </div>
);

const UserMenu: React.FC = () => {
  const { user, tenant } = useSession();
  const logout = useLogout();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-navy-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {getInitials(user?.fullName)}
        </span>
        <span className="hidden text-left sm:flex sm:flex-col">
          <Typography variant={TypographyVariant.BODY_STRONG}>
            {user?.fullName ?? 'Cargando...'}
          </Typography>
          <Typography variant={TypographyVariant.CAPTION}>
            {tenant?.businessName ?? ''}
          </Typography>
        </span>
        <ChevronDown className="h-4 w-4 text-navy-400" aria-hidden />
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
        <Menu.Items className="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-lg border border-navy-200 bg-white py-1 shadow-lg focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                onClick={logout}
                className={tailwind(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-navy-700',
                  active && 'bg-navy-50',
                )}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Cerrar sesion
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
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ title, action, children }) => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-navy-50">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-900 px-4 py-5 md:flex">
        <BrandMark />

        <nav className="mt-8 flex flex-col gap-1">
          {NAVIGATION.map((item) => {
            const isActive =
              router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={tailwind(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-navy-200 bg-white px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo className="shrink-0 text-sm md:hidden" />
            <Typography variant={TypographyVariant.PAGE_TITLE} className="truncate text-lg md:text-2xl">
              {title}
            </Typography>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {action}
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden px-4 py-5 pb-20 md:px-6 md:pb-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-navy-200 bg-white md:hidden">
        {NAVIGATION.map((item) => {
          const isActive =
            router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={tailwind(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
                isActive ? 'text-brand' : 'text-navy-500',
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
