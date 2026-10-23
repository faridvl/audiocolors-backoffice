import { useEffect, useMemo, useState } from 'react';
import { Release, RELEASES } from '@/static/releases';

export enum NotificationKind {
  RELEASE = 'RELEASE',
}

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  icon: string;
  publishedAt: string;
  release: Release;
}

/** Leídas y limpiadas, por usuario: varios pueden compartir la computadora. */
interface NotificationState {
  readIds: string[];
  clearedIds: string[];
}

const EMPTY_STATE: NotificationState = { readIds: [], clearedIds: [] };
const storageKey = (userUuid: string) => `audiocolors.notificaciones.${userUuid}`;
const RELEASE_ICON = '🎉';

function readState(userUuid: string): NotificationState {
  try {
    const raw = window.localStorage.getItem(storageKey(userUuid));
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_STATE;
    const { readIds, clearedIds } = parsed as Partial<NotificationState>;
    return {
      readIds: Array.isArray(readIds) ? readIds.filter((id) => typeof id === 'string') : [],
      clearedIds: Array.isArray(clearedIds)
        ? clearedIds.filter((id) => typeof id === 'string')
        : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(userUuid: string, state: NotificationState) {
  try {
    window.localStorage.setItem(storageKey(userUuid), JSON.stringify(state));
  } catch {
    // Sin almacenamiento (modo privado) vuelven a aparecer como nuevas: no es grave.
  }
}

/** Cada versión publicada es una notificación; más adelante pueden sumarse otros tipos. */
const ALL_NOTIFICATIONS: AppNotification[] = RELEASES.map((release) => ({
  id: `release-${release.version}`,
  kind: NotificationKind.RELEASE,
  icon: RELEASE_ICON,
  publishedAt: release.publishedAt,
  release,
}));

export function useNotifications(userUuid: string | undefined) {
  const [state, setState] = useState<NotificationState>(EMPTY_STATE);
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // localStorage solo existe en el navegador: se lee al montar, no durante el render del servidor.
  useEffect(() => {
    if (!userUuid) return;
    setState(readState(userUuid));
    setIsReady(true);
  }, [userUuid]);

  const update = (next: NotificationState) => {
    setState(next);
    if (userUuid) writeState(userUuid, next);
  };

  const notifications = useMemo(
    () => ALL_NOTIFICATIONS.filter((notification) => !state.clearedIds.includes(notification.id)),
    [state.clearedIds],
  );
  const unreadIds = isReady
    ? notifications.filter((notification) => !state.readIds.includes(notification.id))
    : [];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (!state.readIds.includes(id)) update({ ...state, readIds: [...state.readIds, id] });
  };

  return {
    notifications,
    unreadCount: unreadIds.length,
    isUnread: (id: string) => unreadIds.some((notification) => notification.id === id),
    selected: notifications.find((notification) => notification.id === selectedId) ?? null,
    isOpen,
    handleOpen: () => {
      setSelectedId(null);
      setIsOpen(true);
    },
    handleClose: () => setIsOpen(false),
    handleSelect,
    handleBack: () => setSelectedId(null),
    // Limpiar las saca de la bandeja y las da por leídas.
    handleClear: () =>
      update({
        readIds: Array.from(new Set([...state.readIds, ...notifications.map(({ id }) => id)])),
        clearedIds: Array.from(
          new Set([...state.clearedIds, ...notifications.map(({ id }) => id)]),
        ),
      }),
  };
}
