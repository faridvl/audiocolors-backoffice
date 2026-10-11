import React from 'react';
import { CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { MonthGrid } from '@/components/common/month-grid/month-grid';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';
import { formatMonthLabel } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import {
  ScheduleAppointmentOptions,
  ScheduleMode,
  useScheduleAppointment,
} from './use-schedule-appointment';

/**
 * Modal de la proxima cita, con los dos momentos del flujo de la clinica:
 *
 * 1. **Solo el mes** — al cerrar una visita se anota el mes en que tocaria
 *    volver y de que seria, sin dia. El paciente todavia no confirma nada.
 * 2. **Dia confirmado** — recepcion llama; si el paciente acepta se fija el
 *    dia y, si se sabe, la hora, con el tipo ya precargado del apunte
 *    tentativo (se puede cambiar), y el apunte se limpia. La sede es siempre
 *    la habitual del paciente, no se elige aqui.
 *
 * Los dos modos son excluyentes a proposito: un paciente no puede estar a la
 * vez con cita agendada y pendiente de confirmar.
 */
export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentOptions> = (props) => {
  const { t } = useTranslation();
  const {
    mode,
    month,
    date,
    hour,
    hourOptions,
    selectedTypeUuid,
    appointmentTypes,
    hasNoAppointmentTypes,
    hasNextAppointment,
    currentSummary,
    currentMonth,
    minDate,
    error,
    isPending,
    handleModeChange,
    handleMonthChange,
    handleDateChange,
    handleHourChange,
    handleTypeChange,
    handleBack,
    handleSubmit,
  } = useScheduleAppointment(props);

  const modeTabClasses = (tabMode: ScheduleMode) =>
    tailwind(
      'flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
      mode === tabMode ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
    );
  const isConfirmingClear = mode === ScheduleMode.NONE;

  return (
    <div
      role="dialog"
      aria-modal="true"
      // En el celular sube desde abajo y se desplaza solo: más alto que la pantalla se cortaba arriba.
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={props.onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <CalendarClock className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.PATIENTS.SCHEDULE.TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {t(`${TEXT.PATIENTS.SCHEDULE.DESCRIPTION_PREFIX}.${mode}`)}
            </Typography>
          </div>
        </div>

        {!isConfirmingClear && (
          <div
            className="mt-5 flex rounded-lg bg-ink-100 p-1"
            role="group"
            aria-label={t(TEXT.PATIENTS.SCHEDULE.MODES_ARIA)}
          >
            <button
              type="button"
              onClick={() => handleModeChange(ScheduleMode.MONTH)}
              aria-pressed={mode === ScheduleMode.MONTH}
              className={modeTabClasses(ScheduleMode.MONTH)}
            >
              {t(TEXT.PATIENTS.SCHEDULE.MODE_MONTH)}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange(ScheduleMode.DAY)}
              aria-pressed={mode === ScheduleMode.DAY}
              className={modeTabClasses(ScheduleMode.DAY)}
            >
              {t(TEXT.PATIENTS.SCHEDULE.MODE_DAY)}
            </button>
          </div>
        )}

        {!isConfirmingClear && currentSummary && (
          <Typography
            variant={TypographyVariant.HELPER}
            className="mt-4 rounded-lg bg-ink-50 px-3 py-2"
          >
            {currentSummary}
          </Typography>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {mode === ScheduleMode.MONTH && (
            <div className="flex flex-col gap-1.5">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
                {t(TEXT.PATIENTS.SCHEDULE.MONTH_LABEL)}
                <span className="ml-0.5 text-danger">*</span>
                {month && (
                  <span className="ml-2 font-normal text-ink-500">{formatMonthLabel(month)}</span>
                )}
              </Typography>
              <MonthGrid
                value={month}
                minMonth={currentMonth}
                onChange={handleMonthChange}
                previousYearLabel={t(TEXT.PATIENTS.SCHEDULE.PREVIOUS_YEAR)}
                nextYearLabel={t(TEXT.PATIENTS.SCHEDULE.NEXT_YEAR)}
              />
            </div>
          )}

          {mode === ScheduleMode.DAY && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto] sm:gap-3">
              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="appointment-date">
                  <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
                    {t(TEXT.PATIENTS.SCHEDULE.DATE_LABEL)}
                    <span className="ml-0.5 text-danger">*</span>
                  </Typography>
                </label>
                <input
                  id="appointment-date"
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(event) => handleDateChange(event.target.value)}
                  // Safari de iOS dibuja el input de fecha con su propio estilo:
                  // más alto que los demás, más ancho que el modal y centrado.
                  // Sin apariencia nativa y con la misma altura fija que los
                  // selectores del modal, quedan alineados.
                  className={tailwind(
                    inputBaseClasses,
                    'block h-[46px] min-w-0 appearance-none text-left',
                    '[&::-webkit-date-and-time-value]:text-left',
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
                  {t(TEXT.PATIENTS.SCHEDULE.HOUR_LABEL)}
                </Typography>
                <PillSelect
                  variant={PillSelectVariant.FIELD}
                  ariaLabel={t(TEXT.PATIENTS.SCHEDULE.HOUR_LABEL)}
                  value={hour === null ? '' : String(hour)}
                  onChange={handleHourChange}
                  options={[
                    { value: '', label: t(TEXT.PATIENTS.SCHEDULE.HOUR_NONE) },
                    ...hourOptions,
                  ]}
                  className="sm:w-44"
                />
              </div>
            </div>
          )}

          {/* El tipo va en los dos modos: de que es la cita se sabe desde que
              se anota el mes, y al confirmar el dia llega ya precargado. */}
          {!isConfirmingClear && (
            <div className="flex flex-col gap-1.5">
              <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
                {t(TEXT.PATIENTS.SCHEDULE.TYPE_LABEL)}
                <span className="ml-0.5 text-danger">*</span>
              </Typography>
              <PillSelect
                variant={PillSelectVariant.FIELD}
                ariaLabel={t(TEXT.PATIENTS.SCHEDULE.TYPE_LABEL)}
                value={selectedTypeUuid}
                onChange={handleTypeChange}
                placeholder={t(TEXT.PATIENTS.SCHEDULE.TYPE_PLACEHOLDER)}
                options={appointmentTypes.map((appointmentType) => ({
                  value: appointmentType.uuid,
                  label: appointmentType.name,
                }))}
              />
              {/* El catalogo de tipos no se administra desde el backoffice: si
                el tenant no tiene ninguno, sin este aviso el selector queda
                vacio y no se entiende por que no se puede guardar. */}
              {hasNoAppointmentTypes && (
                <Typography variant={TypographyVariant.HELPER} className="text-danger">
                  {t(TEXT.PATIENTS.SCHEDULE.NO_TYPES)}
                </Typography>
              )}
            </div>
          )}

          {error && <Typography variant={TypographyVariant.ERROR}>{error}</Typography>}

          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            {/* Quitar la cita es poco frecuente: un enlace discreto, no otra pestaña. */}
            {hasNextAppointment && !isConfirmingClear && (
              <button
                type="button"
                onClick={() => handleModeChange(ScheduleMode.NONE)}
                className="py-2 text-sm font-medium text-ink-500 hover:text-danger hover:underline sm:mr-auto"
              >
                {t(`${TEXT.PATIENTS.SCHEDULE.SUBMIT_PREFIX}.${ScheduleMode.NONE}`)}
              </button>
            )}
            <Button
              type="button"
              variant={ButtonVariant.SECONDARY}
              onClick={isConfirmingClear ? handleBack : props.onClose}
              disabled={isPending}
            >
              {isConfirmingClear ? t(TEXT.PATIENTS.SCHEDULE.BACK) : t(TEXT.GENERAL.BUTTONS.CANCEL)}
            </Button>
            <Button
              type="submit"
              variant={isConfirmingClear ? ButtonVariant.DANGER : ButtonVariant.PRIMARY}
              isLoading={isPending}
            >
              {t(`${TEXT.PATIENTS.SCHEDULE.SUBMIT_PREFIX}.${mode}`)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
