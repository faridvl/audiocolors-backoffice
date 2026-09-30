import { useMemo } from 'react';
import { useAppointmentsByDayQuery } from '@/shared/api/querys/appointments-query';
import { buildMonthGrid } from '@/shared/utils/dates';
import { collectBranchColors, isVisibleInAgenda } from '../agenda-presenter';
import { DayMarkers } from '../month-calendar';
import { AgendaState } from '../use-agenda';

/**
 * Puntos de cada día del mes visible: uno por sede con citas, en su color.
 * Respeta el filtro de sede y no cuenta canceladas ni tentativas.
 *
 * El API solo filtra citas por un día, así que un mes son ~30 pedidos en
 * paralelo (en caché, y solo al cambiar de mes). Si pesa, lo correcto es un
 * endpoint de conteo por mes en el API.
 */
export function useMonthMarkers(agenda: AgendaState, monthKey: string): DayMarkers {
  const dayKeys = useMemo(
    () => buildMonthGrid(monthKey).filter((dayKey): dayKey is string => dayKey !== null),
    [monthKey],
  );
  const { data: appointmentsByDay } = useAppointmentsByDayQuery(dayKeys);
  const { matchesBranch, resolveBranchColor } = agenda;

  return useMemo(
    () =>
      Object.fromEntries(
        dayKeys.map((dayKey) => [
          dayKey,
          collectBranchColors(
            (appointmentsByDay?.[dayKey] ?? []).filter(
              (appointment) =>
                isVisibleInAgenda(appointment) && matchesBranch(appointment.branchUUID),
            ),
            resolveBranchColor,
          ),
        ]),
      ),
    [dayKeys, appointmentsByDay, matchesBranch, resolveBranchColor],
  );
}
