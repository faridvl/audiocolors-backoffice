import { useEffect, useMemo, useState } from 'react';
import { usePatientsStaleQuery } from '@/shared/api/querys/patients-stale-query';
import { useNavigation } from '@/hooks/use-navigation';
import { RELEASES, Release } from '@/static/releases';
import {
  AppNotificationOf,
  buildNotifications,
  NotificationKind,
  ReleaseNotification,
} from './build-notifications';

export { NotificationKind };
export type AppNotification = AppNotificationOf<Release>;

/** Leídas y limpiadas, por usuario: varios pueden compartir la computadora. */
interface NotificationState {
  readIds: string[];
  clearedIds: string[];
}

const EMPTY_STATE: NotificationState = { readIds: [], clearedIds: [] };
const storageKey = (userUuid: string) => `audiocolors.notificaciones.${userUuid}`;

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

export function useNotifications(userUuid: string | undefined) {
  const navigation = useNavigation();
  // Si la consulta falla la bandeja sigue con las versiones: solo se usan los datos si llegan.
  const { data: stalePatients } = usePatientsStaleQuery(!!userUuid);
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
    () => buildNotifications(RELEASES, stalePatients ?? [], state.clearedIds),
    [stalePatients, state.clearedIds],
  );
  const unreadIds = isReady
    ? notifications.filter((notification) => !state.readIds.includes(notification.id))
    : [];

  const handleSelect = (id: string) => {
    if (!state.readIds.includes(id)) update({ ...state, readIds: [...state.readIds, id] });
    const notification = notifications.find((item) => item.id === id);
    // El paciente no tiene detalle en la bandeja: se abre su ficha.
    if (notification?.kind === NotificationKind.STALE_PATIENT) {
      setIsOpen(false);
      navigation.patients.detail(notification.patient.uuid);
      return;
    }
    setSelectedId(id);
  };

  return {
    notifications,
    unreadCount: unreadIds.length,
    isUnread: (id: string) => unreadIds.some((notification) => notification.id === id),
    selected:
      notifications.find(
        (notification): notification is ReleaseNotification<Release> =>
          notification.kind === NotificationKind.RELEASE && notification.id === selectedId,
      ) ?? null,
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
