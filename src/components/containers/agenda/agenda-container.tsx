import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CalendarCheck,
  CalendarPlus,
  CalendarX2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  DoorOpen,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { PillSelect } from '@/components/common/pill-select/pill-select';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { ScheduleAppointmentModal } from '@/components/containers/patients/schedule-appointment/schedule-appointment-modal';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { getFullName } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { Appointment, AppointmentStatus } from '@/types/appointments/appointment';
import {
  AgendaSection,
  AppointmentAction,
  formatWeekDay,
  resolveAppointmentActions,
  resolveSection,
} from './agenda-presenter';
import { ActionSheet, SheetAction } from './action-sheet';
import { MonthPicker } from './month-picker';
import { PatientPickerModal } from './patient-picker-modal';
import { AgendaView, ALL_BRANCHES, useAgenda } from './use-agenda';

type AgendaState = ReturnType<typeof useAgenda>;

/** Tono del encabezado de cada grupo del día. */
const SECTION_TONES: Record<AgendaSection, string> = {
  [AgendaSection.IN_ROOM]: 'text-warning',
  [AgendaSection.UPCOMING]: 'text-brand-700',
  [AgendaSection.SCHEDULED]: 'text-brand-700',
  [AgendaSection.UNMARKED]: 'text-ink-500',
  [AgendaSection.DONE]: 'text-success',
};

/** Fondo de la fila según el grupo: solo "en sala" se destaca. */
const SECTION_ROW_STYLES: Record<AgendaSection, string> = {
  [AgendaSection.IN_ROOM]: 'border-warning/40 bg-warning/5 hover:bg-warning/10',
  [AgendaSection.UPCOMING]: 'border-ink-200 bg-white hover:bg-ink-50',
  [AgendaSection.SCHEDULED]: 'border-ink-200 bg-white hover:bg-ink-50',
  [AgendaSection.UNMARKED]: 'border-dashed border-ink-300 bg-white hover:bg-ink-50',
  [AgendaSection.DONE]: 'border-ink-100 bg-ink-50 hover:bg-ink-100',
};

/** Máximo de puntos bajo un día de la franja; más citas no suman puntos. */
const MAX_DAY_DOTS = 3;

const ACTION_ICONS: Record<AppointmentAction, LucideIcon> = {
  [AppointmentAction.MARK_ARRIVED]: DoorOpen,
  [AppointmentAction.MARK_DONE]: CircleCheck,
  [AppointmentAction.UNDO_ARRIVED]: RotateCcw,
  [AppointmentAction.RESCHEDULE]: CalendarX2,
  [AppointmentAction.WHATSAPP]: MessageCircle,
  [AppointmentAction.CALENDAR]: CalendarPlus,
};

const ACTION_LABELS: Record<AppointmentAction, string> = {
  [AppointmentAction.MARK_ARRIVED]: TEXT.AGENDA.ROW.MARK_ARRIVED,
  [AppointmentAction.MARK_DONE]: TEXT.AGENDA.ROW.MARK_DONE,
  [AppointmentAction.UNDO_ARRIVED]: TEXT.AGENDA.MENU.UNDO_ARRIVED,
  [AppointmentAction.RESCHEDULE]: TEXT.AGENDA.MENU.RESCHEDULE,
  [AppointmentAction.WHATSAPP]: TEXT.AGENDA.MENU.WHATSAPP,
  [AppointmentAction.CALENDAR]: TEXT.AGENDA.MENU.CALENDAR,
};

/** Píldora de la sede con su color, igual que en la tabla de pacientes. */
const BranchPill: React.FC<{ name?: string }> = ({ name }) => {
  if (!name) return null;
  const accentColor = getBranchStripeColor(name);
  return (
    <span
      style={accentColor ? { backgroundColor: `${accentColor}1a`, color: accentColor } : undefined}
      className={tailwind(
        'inline-block shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-xs',
        !accentColor && 'bg-ink-100 text-ink-600',
      )}
    >
      {name}
    </span>
  );
};

/** Fila de lista: toda la fila es el único control (RULES §3.1). */
const ListRow: React.FC<{
  title: string;
  subtitle: string;
  /** Punto de color: el tipo de cita. */
  accentColor?: string;
  /** Sede: franja superior de su color, como las tarjetas de pacientes. */
  branchName?: string;
  className?: string;
  isMuted?: boolean;
  trailing?: React.ReactNode;
  onClick: () => void;
}> = ({
  title,
  subtitle,
  accentColor,
  branchName,
  className,
  isMuted = false,
  trailing,
  onClick,
}) => {
  const stripeColor = getBranchStripeColor(branchName);

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        style={stripeColor ? { boxShadow: `inset 0 3px 0 0 ${stripeColor}` } : undefined}
        className={tailwind(
          'flex min-h-[56px] w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
          className ?? 'border-ink-200 bg-white hover:bg-ink-50',
        )}
      >
        <span
          aria-hidden
          style={accentColor ? { backgroundColor: accentColor } : undefined}
          className={tailwind('h-2.5 w-2.5 shrink-0 rounded-full', !accentColor && 'bg-ink-300')}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <Typography
            variant={TypographyVariant.BODY_SEMIBOLD}
            className={tailwind('block truncate', isMuted && 'text-ink-500')}
          >
            {title}
          </Typography>
          <span className="flex min-w-0 items-center gap-2">
            <Typography variant={TypographyVariant.HELPER} className="block truncate">
              {subtitle}
            </Typography>
            <BranchPill name={branchName} />
          </span>
        </span>
        {trailing}
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      </button>
    </li>
  );
};

const DateNavigator: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    // Un solo control con forma de píldora: en móvil ocupa todo el ancho, con
    // las flechas en los extremos (al alcance del pulgar) y la fecha al centro.
    <div className="flex w-full items-center justify-between rounded-full border border-ink-200 bg-white sm:w-auto">
      <button
        type="button"
        onClick={agenda.handlePreviousDay}
        aria-label={t(TEXT.AGENDA.DAY.PREVIOUS)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <MonthPicker
        label={agenda.compactDayLabel}
        selectedDayKey={agenda.selectedDayKey}
        todayKey={agenda.todayKey}
        onSelect={agenda.handleSelectDay}
      />
      <button
        type="button"
        onClick={agenda.handleNextDay}
        aria-label={t(TEXT.AGENDA.DAY.NEXT)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
};

const WeekStrip: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    <div role="group" aria-label={t(TEXT.AGENDA.WEEK.ARIA)} className="grid grid-cols-7 gap-1">
      {agenda.weekDays.map((weekDay) => {
        const { weekday, day } = formatWeekDay(weekDay.dayKey);
        return (
          <button
            key={weekDay.dayKey}
            type="button"
            onClick={() => agenda.handleSelectDay(weekDay.dayKey)}
            aria-pressed={weekDay.isSelected}
            aria-label={t(TEXT.AGENDA.WEEK.DAY_ARIA, {
              date: `${weekday} ${day}`,
              count: weekDay.count,
            })}
            className={tailwind(
              'flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-colors',
              weekDay.isSelected ? 'bg-brand text-white' : 'text-ink-700 hover:bg-ink-100',
            )}
          >
            <span
              className={tailwind(
                'text-xs',
                weekDay.isSelected ? 'text-white/80' : 'text-ink-500',
                !weekDay.isSelected && weekDay.isToday && 'font-semibold text-brand-700',
              )}
            >
              {weekday}
            </span>
            <span
              className={tailwind(
                'text-base font-semibold leading-tight',
                !weekDay.isSelected && weekDay.isToday && 'text-brand-700',
              )}
            >
              {day}
            </span>
            {/* Puntos en vez de números: dicen "hay citas" sin pedir lectura. */}
            <span className="flex h-1.5 items-center gap-0.5" aria-hidden>
              {Array.from({ length: Math.min(weekDay.count, MAX_DAY_DOTS) }, (_, index) => (
                <span
                  key={index}
                  className={tailwind(
                    'h-1.5 w-1.5 rounded-full',
                    weekDay.isSelected ? 'bg-white' : 'bg-brand',
                  )}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const ViewTabs: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();
  const tabs = [
    { view: AgendaView.DAY, label: t(TEXT.AGENDA.TABS.DAY), count: agenda.dayCount },
    {
      view: AgendaView.PENDING,
      label: t(TEXT.AGENDA.TABS.PENDING),
      count: agenda.pendingPatients.length,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label={t(TEXT.AGENDA.TABS.ARIA)}
      className="flex border-b border-ink-200 px-1"
    >
      {tabs.map((tab) => {
        const isActive = agenda.view === tab.view;
        return (
          <button
            key={tab.view}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => agenda.handleViewChange(tab.view)}
            className={tailwind(
              '-mb-px flex min-h-[48px] items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors',
              isActive
                ? 'border-brand text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            {tab.label}
            <span
              className={tailwind(
                'rounded-full px-2 py-0.5 text-xs',
                isActive ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-600',
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const DayList: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();
  const { groups, isLoading, isError } = agenda;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-14 animate-pulse rounded-lg bg-ink-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle className="h-6 w-6 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
          {t(TEXT.AGENDA.STATES.ERROR_TITLE)}
        </Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => void agenda.handleRetry()}>
          {t(TEXT.AGENDA.STATES.RETRY)}
        </Button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
          {t(TEXT.AGENDA.STATES.EMPTY_TITLE)}
        </Typography>
        <Typography variant={TypographyVariant.HELPER} className="max-w-xs">
          {t(TEXT.AGENDA.STATES.EMPTY_DESCRIPTION)}
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.section}>
          <Typography
            variant={TypographyVariant.HELPER}
            as="h3"
            className={tailwind('mb-1.5 font-semibold', SECTION_TONES[group.section])}
          >
            {t(`${TEXT.AGENDA.SECTION_PREFIX}.${group.section}`)} · {group.appointments.length}
          </Typography>
          {group.section === AgendaSection.UNMARKED && (
            <Typography variant={TypographyVariant.HELPER} className="mb-1.5">
              {t(TEXT.AGENDA.UNMARKED_HINT)}
            </Typography>
          )}
          <ul className="flex flex-col gap-1.5">
            {group.appointments.map((appointment) => (
              <ListRow
                key={appointment.id}
                title={appointment.patientName ?? '—'}
                subtitle={[
                  appointment.typeName ?? t(TEXT.AGENDA.ROW.NO_TYPE),
                  agenda.resolveScheduledBy(appointment.userUUID),
                ].join(' · ')}
                accentColor={
                  appointment.typeUUID ? agenda.typeColors[appointment.typeUUID] : undefined
                }
                branchName={agenda.resolveBranchName(appointment.branchUUID)}
                className={SECTION_ROW_STYLES[group.section]}
                isMuted={appointment.status === AppointmentStatus.COMPLETED}
                trailing={
                  appointment.status === AppointmentStatus.COMPLETED ? (
                    <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
                  ) : undefined
                }
                onClick={() => agenda.handleOpenAppointment(appointment.id)}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const PendingList: React.FC<{ agenda: AgendaState }> = ({ agenda }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <Typography variant={TypographyVariant.HELPER}>
        {t(TEXT.AGENDA.PENDING.SUBTITLE, {
          month: agenda.selectedMonthLabel,
          count: agenda.pendingPatients.length,
        })}
      </Typography>

      {agenda.pendingPatients.length === 0 ? (
        <Typography variant={TypographyVariant.HELPER} className="py-8 text-center">
          {t(TEXT.AGENDA.PENDING.EMPTY, { month: agenda.selectedMonthLabel })}
        </Typography>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {agenda.pendingPatients.map((patient) => (
            <ListRow
              key={patient.uuid}
              title={getFullName(patient.firstName, patient.lastName)}
              subtitle={patient.tentativeAppointmentTypeName ?? t(TEXT.AGENDA.ROW.NO_TYPE)}
              branchName={agenda.resolveBranchName(patient.branchUuid)}
              onClick={() => agenda.handleOpenPending(patient.uuid)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const AppointmentSheet: React.FC<{ agenda: AgendaState; appointment: Appointment }> = ({
  agenda,
  appointment,
}) => {
  const { t } = useTranslation();
  const { primary, secondary } = resolveAppointmentActions(appointment, agenda.selectedTiming);
  const section = resolveSection(appointment, agenda.selectedTiming);

  const runAction = (action: AppointmentAction) => {
    switch (action) {
      case AppointmentAction.MARK_ARRIVED:
        return agenda.handleMarkArrived(appointment);
      case AppointmentAction.MARK_DONE:
        return agenda.handleMarkDone(appointment);
      case AppointmentAction.UNDO_ARRIVED:
        return agenda.handleUndoArrived(appointment);
      case AppointmentAction.RESCHEDULE:
        return agenda.handleReschedule(appointment);
      case AppointmentAction.WHATSAPP:
        return void agenda.handleSendWhatsApp(appointment, agenda.selectedDayKey);
      case AppointmentAction.CALENDAR:
        return agenda.handleAddToCalendar(appointment, agenda.selectedDayKey);
    }
  };

  const toSheetAction = (action: AppointmentAction): SheetAction => ({
    label: t(ACTION_LABELS[action]),
    icon: ACTION_ICONS[action],
    onClick: () => runAction(action),
  });

  return (
    <ActionSheet
      title={appointment.patientName ?? '—'}
      status={t(`${TEXT.AGENDA.STATUS_PREFIX}.${section}`)}
      details={[
        { label: t(TEXT.AGENDA.SHEET.DAY), value: agenda.dayTitle },
        {
          label: t(TEXT.AGENDA.SHEET.TYPE),
          value: appointment.typeName ?? t(TEXT.AGENDA.ROW.NO_TYPE),
        },
        {
          label: t(TEXT.AGENDA.SHEET.BRANCH),
          value: agenda.resolveBranchName(appointment.branchUUID) ?? '—',
        },
        {
          label: t(TEXT.AGENDA.SHEET.SCHEDULED_BY),
          value:
            agenda.resolveSchedulerName(appointment.userUUID) ??
            t(TEXT.AGENDA.SHEET.SCHEDULED_BY_UNKNOWN),
        },
      ]}
      primaryAction={primary ? toSheetAction(primary) : undefined}
      isPrimaryLoading={agenda.updatingAppointmentUuid === appointment.id}
      actions={[
        ...secondary.map(toSheetAction),
        {
          label: t(TEXT.AGENDA.MENU.VIEW_PATIENT),
          icon: UserRound,
          onClick: () => agenda.navigateToPatient(appointment.patientUUID),
        },
      ]}
      onClose={agenda.handleCloseAppointment}
    />
  );
};

export const AgendaContainer: React.FC = () => {
  const { t } = useTranslation();
  const agenda = useAgenda();
  const { openAppointment, openPendingPatient } = agenda;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DateNavigator agenda={agenda} />
        {/* En móvil cada control va en su fila, a todo lo ancho. */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {agenda.hasBranches && (
            <div className="w-full sm:w-44">
              <PillSelect
                value={agenda.branchFilter}
                options={agenda.branchOptions}
                onChange={agenda.handleBranchFilter}
                ariaLabel={t(TEXT.AGENDA.FILTERS.BRANCH_ARIA)}
                isActive={agenda.branchFilter !== ALL_BRANCHES}
              />
            </div>
          )}
          <Button
            onClick={agenda.handleOpenPicker}
            icon={<Plus className="h-4 w-4" aria-hidden />}
            className="w-full shrink-0 rounded-full sm:w-auto"
          >
            {t(TEXT.AGENDA.SCHEDULE)}
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-2 sm:p-3">
        <WeekStrip agenda={agenda} />
      </div>

      <section className="rounded-card border border-ink-200 bg-white">
        <ViewTabs agenda={agenda} />
        <div className="p-3 sm:p-4">
          {agenda.view === AgendaView.DAY ? (
            <DayList agenda={agenda} />
          ) : (
            <PendingList agenda={agenda} />
          )}
        </div>
      </section>

      {openAppointment && <AppointmentSheet agenda={agenda} appointment={openAppointment} />}

      {openPendingPatient && (
        <ActionSheet
          title={getFullName(openPendingPatient.firstName, openPendingPatient.lastName)}
          status={t(TEXT.AGENDA.TABS.PENDING)}
          details={[
            { label: t(TEXT.AGENDA.SHEET.MONTH), value: agenda.selectedMonthLabel },
            {
              label: t(TEXT.AGENDA.SHEET.TYPE),
              value: openPendingPatient.tentativeAppointmentTypeName ?? t(TEXT.AGENDA.ROW.NO_TYPE),
            },
            { label: t(TEXT.AGENDA.SHEET.PHONE), value: openPendingPatient.phone ?? '—' },
          ]}
          primaryAction={{
            label: t(TEXT.AGENDA.PENDING.SET_DAY),
            icon: CalendarCheck,
            onClick: () => agenda.handleSetPendingDay(openPendingPatient),
          }}
          actions={[
            ...(openPendingPatient.phone
              ? [
                  {
                    label: t(TEXT.AGENDA.PENDING.CALL_SHORT),
                    icon: Phone,
                    onClick: () => agenda.handleCallPatient(openPendingPatient),
                  },
                ]
              : []),
            {
              label: t(TEXT.AGENDA.MENU.VIEW_PATIENT),
              icon: UserRound,
              onClick: () => agenda.navigateToPatient(openPendingPatient.uuid),
            },
          ]}
          onClose={agenda.handleClosePending}
        />
      )}

      {agenda.isPickerOpen && (
        <PatientPickerModal onPick={agenda.handlePickPatient} onClose={agenda.handleClosePicker} />
      )}

      {agenda.scheduleTarget && (
        <ScheduleAppointmentModal
          patientUuid={agenda.scheduleTarget.patientUuid}
          tentativeMonth={agenda.scheduleTarget.tentativeMonth}
          tentativeTypeUuid={agenda.scheduleTarget.typeUuid}
          branchUuid={agenda.scheduleTarget.branchUuid}
          initialMode={agenda.scheduleTarget.initialMode}
          onClose={agenda.handleCloseSchedule}
        />
      )}
    </div>
  );
};
