import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@/hooks/use-navigation';
import {
  FETCH_APPOINTMENTS_KEY,
  useAppointmentsByDayQuery,
} from '@/shared/api/querys/appointments-query';
import { useAppointmentTypesQuery } from '@/shared/api/querys/appointment-types-query';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { FETCH_PATIENT_KEY } from '@/shared/api/querys/get-patient-query';
import {
  FETCH_PATIENT_ACTIVITY_KEY,
  usePatientActivityActorsQuery,
} from '@/shared/api/querys/patient-activity-query';
import { useSession } from '@/hooks/use-session';
import { PatientStatusFilter, usePatientsQuery } from '@/shared/api/querys/patients-query';
import { useUpdateAppointmentStatusMutation } from '@/shared/api/mutations/appointments/update-appointment-status-mutation';
import { ApiServiceClient } from '@/shared/api/api-service-client';
import { env } from '@/shared/api/config';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { downloadCalendarEvent } from '@/shared/utils/calendar-file';
import { formatMonthLabel } from '@/shared/utils/formatters';
import { buildWhatsAppLink } from '@/shared/utils/whatsapp';
import { TEXT } from '@/static/texts/i18n';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';
import { Patient, PatientStatus } from '@/types/patients/patient';
import { ScheduleMode } from '@/components/containers/patients/schedule-appointment/schedule-appointment-modal';
import {
  addDays,
  buildWeekDayKeys,
  capitalize,
  DayTiming,
  formatLongDay,
  formatCompactDay,
  fromDayKey,
  getDayTiming,
  groupAppointments,
  isVisibleInAgenda,
  startOfWeek,
  toDayKey,
  toMonthKey,
} from './agenda-presenter';

export const ALL_BRANCHES = 'all';

/**
 * El día y la sede viven en la URL (`/agenda?dia=2026-10-28&sede=…`), no en
 * estado local: al abrir un expediente y volver atrás, la agenda regresa al
 * mismo día en vez de saltar a hoy.
 */
const DAY_PARAM = 'dia';
const BRANCH_PARAM = 'sede';
const VIEW_PARAM = 'vista';
const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

/** Las dos tareas de la agenda, una a la vez: atender el día o llamar. */
export enum AgendaView {
  DAY = 'dia',
  PENDING = 'por-confirmar',
}

/**
 * El pedido de "Por confirmar" usa el filtro de próxima cita del listado de
 * pacientes: con ese filtro el API devuelve todos los del mes en una página.
 */
const PENDING_LIMIT = 200;

/** Lo que necesita el modal de próxima cita que ya usa el expediente. */
export interface ScheduleTarget {
  patientUuid: string;
  tentativeMonth?: string | null;
  typeUuid?: string | null;
  branchUuid?: string | null;
  initialMode: ScheduleMode;
}

export function useAgenda() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();

  // "Hoy" se fija al montar, igual que en la bitácora.
  const todayKey = useMemo(() => toDayKey(new Date()), []);

  const dayParam = readParam(router.query[DAY_PARAM]);
  const selectedDayKey = dayParam && DAY_KEY_PATTERN.test(dayParam) ? dayParam : todayKey;
  const branchFilter = readParam(router.query[BRANCH_PARAM]) ?? ALL_BRANCHES;
  const view =
    readParam(router.query[VIEW_PARAM]) === AgendaView.PENDING
      ? AgendaView.PENDING
      : AgendaView.DAY;
  const weekStart = useMemo(() => startOfWeek(fromDayKey(selectedDayKey)), [selectedDayKey]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget | null>(null);
  const [updatingAppointmentUuid, setUpdatingAppointmentUuid] = useState<string | null>(null);
  /** Ficha abierta: una cita del día o un paciente por confirmar. */
  const [openAppointmentUuid, setOpenAppointmentUuid] = useState<string | null>(null);
  const [openPendingUuid, setOpenPendingUuid] = useState<string | null>(null);

  const weekDayKeys = useMemo(() => buildWeekDayKeys(weekStart), [weekStart]);
  const selectedMonthKey = toMonthKey(selectedDayKey);
  const selectedTiming = getDayTiming(selectedDayKey, todayKey);

  const {
    data: appointmentsByDay,
    isLoading,
    isError,
    refetch,
  } = useAppointmentsByDayQuery(weekDayKeys);
  const { data: appointmentTypes } = useAppointmentTypesQuery();
  const { data: branches } = useBranchesQuery();
  const { data: actors } = usePatientActivityActorsQuery();
  const { user } = useSession();
  const { data: monthPatients } = usePatientsQuery(
    1,
    PENDING_LIMIT,
    '',
    PatientStatusFilter.ACTIVE,
    selectedMonthKey,
    { status: PatientStatus.ACTIVE },
  );
  const { executeUpdateAppointmentStatus } = useUpdateAppointmentStatusMutation();

  const matchesBranch = useCallback(
    (branchUuid?: string | null) => branchFilter === ALL_BRANCHES || branchUuid === branchFilter,
    [branchFilter],
  );

  /** Citas visibles de cada día de la semana, ya filtradas por sede. */
  const visibleByDay = useMemo(
    () =>
      Object.fromEntries(
        weekDayKeys.map((dayKey) => [
          dayKey,
          (appointmentsByDay?.[dayKey] ?? []).filter(
            (appointment) =>
              isVisibleInAgenda(appointment) && matchesBranch(appointment.branchUUID),
          ),
        ]),
      ) as Record<string, Appointment[]>,
    [appointmentsByDay, weekDayKeys, matchesBranch],
  );

  const weekDays = useMemo(
    () =>
      weekDayKeys.map((dayKey) => ({
        dayKey,
        count: visibleByDay[dayKey]?.length ?? 0,
        isToday: dayKey === todayKey,
        isSelected: dayKey === selectedDayKey,
      })),
    [weekDayKeys, visibleByDay, todayKey, selectedDayKey],
  );

  const selectedAppointments = useMemo(
    () => visibleByDay[selectedDayKey] ?? [],
    [visibleByDay, selectedDayKey],
  );
  const groups = useMemo(
    () => groupAppointments(selectedAppointments, selectedTiming),
    [selectedAppointments, selectedTiming],
  );

  const dayTitle = useMemo(() => {
    const label = formatLongDay(selectedDayKey, todayKey);
    return selectedTiming === DayTiming.TODAY
      ? t(TEXT.AGENDA.DAY.TODAY, { date: label })
      : capitalize(label);
  }, [selectedDayKey, selectedTiming, todayKey, t]);

  const compactDayLabel =
    selectedTiming === DayTiming.TODAY
      ? t(TEXT.AGENDA.DAY.TODAY, { date: formatCompactDay(selectedDayKey) })
      : capitalize(formatCompactDay(selectedDayKey));

  // Tentativo y confirmado son excluyentes: el filtro del API trae los dos,
  // aquí quedan solo los que todavía no tienen día.
  const pendingPatients = useMemo(
    () =>
      (monthPatients?.data ?? [])
        .filter(
          (patient) =>
            patient.tentativeAppointmentMonth === selectedMonthKey &&
            matchesBranch(patient.branchUuid),
        )
        .sort((first, second) =>
          `${first.firstName} ${first.lastName}`.localeCompare(
            `${second.firstName} ${second.lastName}`,
            'es',
          ),
        ),
    [monthPatients, selectedMonthKey, matchesBranch],
  );

  const openAppointment = selectedAppointments.find(
    (appointment) => appointment.id === openAppointmentUuid,
  );
  const openPendingPatient = pendingPatients.find((patient) => patient.uuid === openPendingUuid);

  const typeColors = useMemo(
    () =>
      Object.fromEntries(
        (appointmentTypes ?? []).map((type) => [type.uuid, type.color ?? undefined]),
      ) as Record<string, string | undefined>,
    [appointmentTypes],
  );

  const branchOptions = useMemo(
    () => [
      { label: t(TEXT.AGENDA.FILTERS.ALL_BRANCHES), value: ALL_BRANCHES },
      ...(branches ?? []).map((branch) => ({
        label: branch.name,
        value: branch.uuid,
        accentColor: getBranchStripeColor(branch.name),
      })),
    ],
    [branches, t],
  );

  /**
   * Nombre de pila de quien agendó. Sale de las personas con acciones en la
   * bitácora (el API no expone la lista de usuarios); si no aparece ahí, y
   * no es la sesión actual, se muestra un texto genérico.
   */
  const resolveSchedulerName = useCallback(
    (userUuid: string): string | null =>
      actors?.find((actor) => actor.uuid === userUuid)?.fullName ??
      (user?.uuid === userUuid ? (user.fullName ?? null) : null),
    [actors, user],
  );

  /** "Agendó María": en la fila, solo el nombre de pila. */
  const resolveScheduledBy = useCallback(
    (userUuid: string) => {
      const fullName = resolveSchedulerName(userUuid);
      return fullName
        ? t(TEXT.AGENDA.ROW.SCHEDULED_BY, { name: fullName.split(' ')[0] })
        : t(TEXT.AGENDA.ROW.SCHEDULED_BY_UNKNOWN);
    },
    [resolveSchedulerName, t],
  );

  const resolveBranchName = useCallback(
    (branchUuid?: string | null) =>
      branchUuid ? branches?.find((branch) => branch.uuid === branchUuid)?.name : undefined,
    [branches],
  );

  /**
   * `replace` y no `push`: moverse por la agenda no llena el historial, así
   * que "atrás" desde un expediente vuelve directo al día que se veía.
   */
  const updateQuery = (changes: Record<string, string | undefined>) => {
    const query = { ...router.query, ...changes };
    Object.keys(query).forEach((key) => query[key] === undefined && delete query[key]);
    void router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const handleSelectDay = (dayKey: string) =>
    updateQuery({ [DAY_PARAM]: dayKey === todayKey ? undefined : dayKey });

  const handlePreviousDay = () =>
    handleSelectDay(toDayKey(addDays(fromDayKey(selectedDayKey), -1)));
  const handleNextDay = () => handleSelectDay(toDayKey(addDays(fromDayKey(selectedDayKey), 1)));

  const handleViewChange = (nextView: AgendaView) =>
    updateQuery({ [VIEW_PARAM]: nextView === AgendaView.DAY ? undefined : nextView });

  const handleBranchFilter = (branchUuid: string) =>
    updateQuery({ [BRANCH_PARAM]: branchUuid === ALL_BRANCHES ? undefined : branchUuid });

  const changeStatus = (
    appointment: Appointment,
    status: AppointmentStatus,
    successText: string,
  ) => {
    setUpdatingAppointmentUuid(appointment.id);
    executeUpdateAppointmentStatus(
      { appointmentUuid: appointment.id, status },
      {
        onSuccess: () => {
          toast.success(t(successText, { name: appointment.patientName ?? '' }));
          setOpenAppointmentUuid(null);
          void queryClient.invalidateQueries({ queryKey: [FETCH_APPOINTMENTS_KEY] });
          void queryClient.invalidateQueries({ queryKey: [FETCH_PATIENT_ACTIVITY_KEY] });
        },
        onError: (error: Error) => toast.error(error.message),
        onSettled: () => setUpdatingAppointmentUuid(null),
      },
    );
  };

  const handleMarkArrived = (appointment: Appointment) =>
    changeStatus(appointment, AppointmentStatus.WAITING, TEXT.AGENDA.TOASTS.ARRIVED);

  const handleMarkDone = (appointment: Appointment) =>
    changeStatus(appointment, AppointmentStatus.COMPLETED, TEXT.AGENDA.TOASTS.DONE);

  const handleUndoArrived = (appointment: Appointment) =>
    changeStatus(appointment, AppointmentStatus.CONFIRMED, TEXT.AGENDA.TOASTS.UNDONE);

  const handleReschedule = (appointment: Appointment) => {
    setOpenAppointmentUuid(null);
    setScheduleTarget({
      patientUuid: appointment.patientUUID,
      typeUuid: appointment.typeUUID,
      branchUuid: appointment.branchUUID,
      initialMode: ScheduleMode.DAY,
    });
  };

  const handleSetPendingDay = (patient: Patient) => {
    setOpenPendingUuid(null);
    setScheduleTarget({
      patientUuid: patient.uuid,
      tentativeMonth: patient.tentativeAppointmentMonth,
      typeUuid: patient.tentativeAppointmentTypeUuid,
      branchUuid: patient.branchUuid,
      initialMode: ScheduleMode.DAY,
    });
  };

  const handlePickPatient = (patient: Patient) => {
    setIsPickerOpen(false);
    setScheduleTarget({
      patientUuid: patient.uuid,
      tentativeMonth: patient.tentativeAppointmentMonth,
      typeUuid: patient.tentativeAppointmentTypeUuid,
      branchUuid: patient.branchUuid,
      initialMode: ScheduleMode.DAY,
    });
  };

  const handleCallPatient = (patient: Patient) => {
    if (patient.phone) window.location.href = `tel:${patient.phone.replace(/\s/g, '')}`;
  };

  const handleSendWhatsApp = async (appointment: Appointment, dayKey: string) => {
    // La ventana se abre antes de pedir el teléfono: Safari bloquea un
    // window.open que llega después de un await.
    const whatsappWindow = window.open('', '_blank');

    try {
      const patient = await queryClient.fetchQuery({
        queryKey: [FETCH_PATIENT_KEY, appointment.patientUUID],
        queryFn: () =>
          ApiServiceClient(env.API.MEDICAL_RECORDS_URL).get<Patient>(
            `/patients/${appointment.patientUUID}`,
          ),
        staleTime: 1000 * 60 * 5,
      });

      const link = buildWhatsAppLink(
        patient.phone,
        t(TEXT.AGENDA.WHATSAPP_MESSAGE, {
          name: patient.firstName,
          date: formatLongDay(dayKey, todayKey),
        }),
      );

      if (!link) {
        whatsappWindow?.close();
        toast.error(t(TEXT.AGENDA.TOASTS.NO_PHONE));
        return;
      }

      if (whatsappWindow) {
        whatsappWindow.location.href = link;
      } else {
        window.location.href = link;
      }
    } catch {
      whatsappWindow?.close();
      toast.error(t(TEXT.AGENDA.TOASTS.PHONE_ERROR));
    }
  };

  const handleAddToCalendar = (appointment: Appointment, dayKey: string) => {
    const name = appointment.patientName ?? '';
    downloadCalendarEvent(
      {
        uid: appointment.id,
        dayKey,
        title: t(TEXT.AGENDA.CALENDAR_EVENT.TITLE, { name }),
        description: t(TEXT.AGENDA.CALENDAR_EVENT.DESCRIPTION, {
          type: appointment.typeName ?? t(TEXT.AGENDA.ROW.NO_TYPE),
        }),
      },
      `cita-${dayKey}`,
    );
  };

  return {
    todayKey,
    view,
    weekDays,
    selectedDayKey,
    selectedTiming,
    selectedMonthLabel: formatMonthLabel(selectedMonthKey),
    dayTitle,
    compactDayLabel,
    dayCount: selectedAppointments.length,
    groups,
    isLoading,
    isError,
    branchFilter,
    branchOptions,
    hasBranches: (branches?.length ?? 0) > 1,
    typeColors,
    resolveBranchName,
    resolveScheduledBy,
    resolveSchedulerName,
    pendingPatients,
    openAppointment,
    openPendingPatient,
    isPickerOpen,
    scheduleTarget,
    updatingAppointmentUuid,
    handlePreviousDay,
    handleNextDay,
    handleSelectDay,
    handleViewChange,
    handleBranchFilter,
    handleOpenAppointment: setOpenAppointmentUuid,
    handleCloseAppointment: () => setOpenAppointmentUuid(null),
    handleOpenPending: setOpenPendingUuid,
    handleClosePending: () => setOpenPendingUuid(null),
    handleOpenPicker: () => setIsPickerOpen(true),
    handleClosePicker: () => setIsPickerOpen(false),
    handlePickPatient,
    handleCloseSchedule: () => setScheduleTarget(null),
    handleMarkArrived,
    handleMarkDone,
    handleUndoArrived,
    handleReschedule,
    handleSetPendingDay,
    handleSendWhatsApp,
    handleCallPatient,
    handleAddToCalendar,
    handleRetry: refetch,
    navigateToPatient: navigation.patients.detail,
  };
}
