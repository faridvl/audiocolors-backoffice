import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import {
  Users,
  CalendarDays,
  CalendarSync,
  History,
  LogOut,
  ChevronDown,
  Bell,
  ArrowLeft,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { CalendarSyncSheet } from '@/components/containers/agenda/calendar-sync/calendar-sync-sheet';
import { CountBadge } from '@/components/common/badge/count-badge';
import { NotificationsPanel } from '@/components/containers/notifications/notifications-panel';
import { useNotifications } from '@/components/containers/notifications/use-notifications';
import { SETTINGS_SECTIONS } from '@/components/containers/settings/settings-sections';
import { TEXT } from '@/static/texts/i18n';
import { routesPrivate } from '@/shared/navigation/routes';
import { useIsIphone } from '@/hooks/use-is-iphone';
import { useSession } from '@/hooks/use-session';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission } from '@/shared/auth/permissions';
import { useLogout } from '@/hooks/use-logout';
import { tailwind } from '@/utils/tailwind-utils';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface NavigationItem {
  /** Clave de `TEXT`: el menú se arma fuera de un componente, se traduce al dibujarlo. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
  /** Sin permiso, el rol no ve la entrada. */
  permission?: Permission;
}

const NAVIGATION: NavigationItem[] = [
  { labelKey: TEXT.LAYOUT.NAV.PATIENTS, href: routesPrivate.patients.index, icon: Users },
  { labelKey: TEXT.LAYOUT.NAV.AGENDA, href: routesPrivate.agenda.index, icon: CalendarDays },
  {
    labelKey: TEXT.LAYOUT.NAV.ACTIVITY,
    href: routesPrivate.activity.index,
    icon: History,
    permission: Permission.VIEW_ACTIVITY,
  },
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

const UserMenu: React.FC = () => {
  const { user, tenant } = useSession();
  const logout = useLogout();
  const { t } = useTranslation();
  const isIphone = useIsIphone();
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const notifications = useNotifications(user?.uuid);

  return (
    // La bandeja de notificaciones se despliega desde acá, debajo del avatar.
    <div className="relative">
      <Menu as="div" className="relative">
        <Menu.Button className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink-100">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {getInitials(user?.fullName)}
            {/* Invita a abrir el menú: ahí está la novedad sin ver. */}
            {notifications.unreadCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white"
                aria-hidden
              />
            )}
          </span>
          <span className="hidden text-left lg:flex lg:flex-col">
            <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
              {user?.fullName ?? t(TEXT.LAYOUT.LOADING_USER)}
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
            <div className="border-b border-ink-100 px-3 py-2 lg:hidden">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="truncate">
                {user?.fullName ?? t(TEXT.LAYOUT.LOADING_USER)}
              </Typography>
              <Typography variant={TypographyVariant.HELPER} className="truncate">
                {tenant?.businessName ?? ''}
              </Typography>
            </div>

            {/* La suscripción webcal solo la abre bien el Calendario del iPhone. */}
            {isIphone && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => setIsCalendarSyncOpen(true)}
                    className={tailwind(
                      'flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700',
                      active && 'bg-ink-50',
                    )}
                  >
                    <CalendarSync className="h-4 w-4" aria-hidden />
                    {t(TEXT.AGENDA.CALENDAR_SYNC.MENU)}
                  </button>
                )}
              </Menu.Item>
            )}

            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={notifications.handleOpen}
                  className={tailwind(
                    'flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-700',
                    active && 'bg-ink-50',
                  )}
                >
                  <Bell className="h-4 w-4" aria-hidden />
                  <span className="flex-1">{t(TEXT.NOTIFICATIONS.MENU)}</span>
                  <CountBadge
                    count={notifications.unreadCount}
                    ariaLabel={t(TEXT.NOTIFICATIONS.UNREAD_COUNT, {
                      count: notifications.unreadCount,
                    })}
                  />
                </button>
              )}
            </Menu.Item>

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
                  {t(TEXT.LAYOUT.LOGOUT)}
                </button>
              )}
            </Menu.Item>

            <Typography
              variant={TypographyVariant.HELPER}
              className="border-t border-ink-100 px-3 pb-1 pt-2 text-ink-400"
            >
              {t(TEXT.LAYOUT.VERSION, { version: process.env.NEXT_PUBLIC_APP_VERSION })}
            </Typography>
          </Menu.Items>
        </Transition>
      </Menu>

      {isCalendarSyncOpen && <CalendarSyncSheet onClose={() => setIsCalendarSyncOpen(false)} />}

      {notifications.isOpen && (
        <NotificationsPanel
          notifications={notifications.notifications}
          selected={notifications.selected}
          isUnread={notifications.isUnread}
          onSelect={notifications.handleSelect}
          onBack={notifications.handleBack}
          onClear={notifications.handleClear}
          onClose={notifications.handleClose}
        />
      )}
    </div>
  );
};

const SidebarLink: React.FC<{ item: NavigationItem; isActive: boolean }> = ({ item, isActive }) => {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={tailwind(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {t(item.labelKey)}
    </Link>
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
  const { t } = useTranslation();
  const { can } = usePermissions();
  const canOpenSettings = SETTINGS_SECTIONS.some((item) => can(item.permission));
  const mainNavigation = NAVIGATION.filter((item) => !item.permission || can(item.permission));
  const settingsItem: NavigationItem | null = canOpenSettings
    ? { labelKey: TEXT.SETTINGS.NAV, href: routesPrivate.settings.index, icon: Settings }
    : null;
  // En el celular va como una pestaña más; en el menú lateral, sola al fondo.
  const mobileNavigation = settingsItem ? [...mainNavigation, settingsItem] : mainNavigation;

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
            {t(TEXT.LAYOUT.APP_LABEL)}
          </Typography>
        </div>

        <nav className="mt-5 flex flex-col gap-1">
          {mainNavigation.map((item) => (
            <SidebarLink key={item.href} item={item} isActive={isActiveRoute(item.href)} />
          ))}
        </nav>

        {settingsItem && (
          <nav className="mt-auto border-t border-ink-100 pt-3">
            <SidebarLink item={settingsItem} isActive={isActiveRoute(settingsItem.href)} />
          </nav>
        )}
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
            // El lugar de la barra queda reservado: al pasar de una página corta a una larga el contenido no se corre.
            '[scrollbar-gutter:stable]',
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
        {mobileNavigation.map((item) => {
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
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
