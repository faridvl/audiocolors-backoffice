import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { ResponsiveTable, TableColumn } from '@/components/common/table/responsive-table';
import { Pagination } from '@/components/common/table/pagination';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { FilterBar, FilterBarField } from '@/components/common/filter-bar/filter-bar';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { PatientActivityAction } from '@/types/patient-activity/patient-activity';
import {
  ACTION_STYLES,
  ActivityRow,
  formatActivityDetail,
  formatDayGroup,
  formatTime,
  getActionLabel,
} from './patient-activity-presenter';
import { ActivityScope, ALL_VALUE, usePatientActivity } from './use-patient-activity';
import { BranchBadge } from '@/components/common/badge/branch-badge';

const DateField: React.FC<{
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}> = ({ label, value, min, max, onChange }) => (
  // Desde `sm` la etiqueta sube por encima de la fila: el campo queda a la altura del buscador.
  <label className="relative flex min-w-0 flex-col gap-1 sm:w-40">
    <Typography
      variant={TypographyVariant.HELPER}
      as="span"
      className="sm:absolute sm:bottom-full sm:mb-0.5"
    >
      {label}
    </Typography>
    <input
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(event) => onChange(event.target.value)}
      // Safari de iOS dibuja el input de fecha más alto y centrado: sin apariencia nativa se alinea.
      className={tailwind(
        inputBaseClasses,
        'block h-11 min-w-0 appearance-none text-left sm:h-[46px]',
        '[&::-webkit-date-and-time-value]:text-left',
      )}
    />
  </label>
);

const ActionPill: React.FC<{ action: PatientActivityAction; label: string }> = ({
  action,
  label,
}) => {
  const { icon: Icon, tone } = ACTION_STYLES[action];
  return (
    <span
      className={tailwind(
        'inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium',
        tone,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
};

export const PatientActivityContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    rows,
    meta,
    now,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    searchTerm,
    scope,
    actorFilter,
    actionFilter,
    fromDay,
    toDay,
    todayKey,
    actorOptions,
    actionOptions,
    branchFilter,
    branchOptions,
    typeFilter,
    typeOptions,
    resolveBranchName,
    setSearchTerm,
    handleScopeChange,
    handleActorFilter,
    handleActionFilter,
    handleFromDayChange,
    handleToDayChange,
    handleBranchFilter,
    handleTypeFilter,
    handlePageChange,
    handleRetry,
    navigateToPatient,
  } = usePatientActivity();

  const columns = useMemo<TableColumn<ActivityRow>[]>(
    () => [
      {
        key: 'time',
        header: t(TEXT.ACTIVITY.COLUMNS.TIME),
        width: '9%',
        render: (row) => (
          <span className="tabular-nums text-ink-500">{formatTime(row.activity.createdAt)}</span>
        ),
      },
      {
        key: 'patient',
        header: t(TEXT.ACTIVITY.COLUMNS.PATIENT),
        width: '24%',
        isCardTitle: true,
        render: (row) => (
          <div className="flex flex-col">
            <Typography variant={TypographyVariant.BODY}>{row.activity.patientName}</Typography>
            <BranchBadge
              className="mt-0.5"
              name={
                row.activity.patientBranchUuid
                  ? resolveBranchName(row.activity.patientBranchUuid)
                  : undefined
              }
            />
          </div>
        ),
      },
      {
        key: 'action',
        header: t(TEXT.ACTIVITY.COLUMNS.ACTION),
        width: '19%',
        render: (row) => (
          <ActionPill action={row.activity.action} label={getActionLabel(t, row.activity.action)} />
        ),
      },
      {
        key: 'detail',
        header: t(TEXT.ACTIVITY.COLUMNS.DETAIL),
        render: (row) => (
          <span className="break-words">{formatActivityDetail(row, { t, resolveBranchName })}</span>
        ),
      },
      {
        key: 'actor',
        header: t(TEXT.ACTIVITY.COLUMNS.ACTOR),
        width: '15%',
        render: (row) => (
          <span className="italic">{row.activity.actorName ?? t(TEXT.ACTIVITY.UNKNOWN_ACTOR)}</span>
        ),
      },
    ],
    [t, resolveBranchName],
  );

  const scopeOptions = [
    { value: ActivityScope.APPOINTMENTS, label: t(TEXT.ACTIVITY.FILTERS.SCOPE_APPOINTMENTS) },
    { value: ActivityScope.ALL, label: t(TEXT.ACTIVITY.FILTERS.SCOPE_ALL) },
  ];

  const filterFields: FilterBarField[] = [
    {
      key: 'actor',
      label: t(TEXT.ACTIVITY.FILTERS.ACTOR_LABEL),
      value: actorFilter,
      options: actorOptions,
      allValue: ALL_VALUE,
      onChange: handleActorFilter,
    },
    {
      key: 'action',
      label: t(TEXT.ACTIVITY.FILTERS.ACTION_LABEL),
      value: actionFilter,
      options: actionOptions,
      allValue: ALL_VALUE,
      onChange: handleActionFilter,
    },
    {
      key: 'branch',
      label: t(TEXT.ACTIVITY.FILTERS.BRANCH_LABEL),
      value: branchFilter,
      options: branchOptions,
      allValue: ALL_VALUE,
      onChange: handleBranchFilter,
    },
    // El tipo de cita solo existe en las acciones de cita.
    ...(scope === ActivityScope.APPOINTMENTS
      ? [
          {
            key: 'type',
            label: t(TEXT.ACTIVITY.FILTERS.TYPE_LABEL),
            value: typeFilter,
            options: typeOptions,
            allValue: ALL_VALUE,
            onChange: handleTypeFilter,
          },
        ]
      : []),
  ];

  return (
    // `sm:pt-5`: lugar para las etiquetas Desde/Hasta, que desde `sm` quedan sobre la fila.
    <div className="flex flex-col gap-4 sm:pt-5">
      <FilterBar
        leading={
          <>
            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
                aria-hidden
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t(TEXT.ACTIVITY.FILTERS.SEARCH_PLACEHOLDER)}
                aria-label={t(TEXT.ACTIVITY.FILTERS.SEARCH_ARIA)}
                className={tailwind(inputBaseClasses, 'pl-9')}
              />
            </div>

            {/* Desde/hasta: en el celular lado a lado, cada uno la mitad. */}
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <DateField
                label={t(TEXT.ACTIVITY.FILTERS.FROM_LABEL)}
                value={fromDay}
                max={toDay || todayKey}
                onChange={handleFromDayChange}
              />
              <DateField
                label={t(TEXT.ACTIVITY.FILTERS.TO_LABEL)}
                value={toDay}
                min={fromDay}
                max={todayKey}
                onChange={handleToDayChange}
              />
            </div>

            <div
              role="radiogroup"
              aria-label={t(TEXT.ACTIVITY.FILTERS.SCOPE_ARIA)}
              className="flex rounded-lg bg-ink-100 p-1"
            >
              {scopeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={scope === option.value}
                  onClick={() => handleScopeChange(option.value)}
                  className={tailwind(
                    'flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                    scope === option.value
                      ? 'bg-white text-ink-900 shadow-sm'
                      : 'text-ink-500 hover:text-ink-800',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        }
        fields={filterFields}
        resultCount={meta?.total}
      />

      {!isLoading && !isError && !!meta?.total && (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.ACTIVITY.COUNT, { count: meta.total })}
        </Typography>
      )}

      <ResponsiveTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.key}
        getRowGroup={(row) => formatDayGroup(t, row.activity.createdAt, now)}
        isLoading={isLoading}
        isError={isError}
        hasActiveFilters={hasActiveFilters}
        onRetry={handleRetry}
        onRowClick={(row) => navigateToPatient(row.activity.patientUuid)}
        rowAccentColor={(row) =>
          row.activity.patientBranchUuid
            ? getBranchStripeColor(resolveBranchName(row.activity.patientBranchUuid))
            : undefined
        }
        errorTitle={t(TEXT.ACTIVITY.STATES.ERROR_TITLE)}
        emptyTitle={t(TEXT.ACTIVITY.STATES.EMPTY_TITLE)}
        emptyDescription={t(TEXT.ACTIVITY.STATES.EMPTY_DESCRIPTION)}
        noResultsTitle={t(TEXT.ACTIVITY.STATES.NO_RESULTS_TITLE)}
        noResultsDescription={t(TEXT.ACTIVITY.STATES.NO_RESULTS_DESCRIPTION)}
      />

      {meta && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
