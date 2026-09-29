import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Search } from 'lucide-react';
import { ResponsiveTable, TableColumn } from '@/components/common/table/responsive-table';
import { Pagination } from '@/components/common/table/pagination';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { FilterBar, FilterBarField } from '@/components/common/filter-bar/filter-bar';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import {
  PatientActivityAction,
  PatientActivitySummary,
} from '@/types/patient-activity/patient-activity';
import {
  ACTION_STYLES,
  ActivityRow,
  formatActivityDetail,
  formatDayGroup,
  formatTime,
  getActionLabel,
} from './patient-activity-presenter';
import { ActivityScope, ALL_VALUE, usePatientActivity } from './use-patient-activity';

const SummaryCard: React.FC<{ label: string; value?: number; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="rounded-card border border-ink-200 bg-white px-4 py-3">
    <Typography variant={TypographyVariant.HELPER}>{label}</Typography>
    <Typography variant={TypographyVariant.HEADER} as="p">
      {value ?? '—'}
    </Typography>
    {hint && (
      <Typography variant={TypographyVariant.HELPER} className="truncate">
        {hint}
      </Typography>
    )}
  </div>
);

/** "María 5 · Matthew 3": solo el primer nombre, para que quepa en la tarjeta. */
function formatActorBreakdown(t: TFunction, summary?: PatientActivitySummary): string | undefined {
  if (!summary) return undefined;
  if (summary.total === 0) return t(TEXT.ACTIVITY.SUMMARY.TODAY_EMPTY);
  return summary.byActor
    .map((actor) =>
      t(TEXT.ACTIVITY.SUMMARY.BY_ACTOR, {
        name: actor.actorName?.split(' ')[0] ?? t(TEXT.ACTIVITY.UNKNOWN_ACTOR),
        count: actor.count,
      }),
    )
    .join(' · ');
}

const BranchPill: React.FC<{ name?: string }> = ({ name }) => {
  if (!name) return null;
  const accentColor = getBranchStripeColor(name);
  return (
    <span
      style={accentColor ? { backgroundColor: `${accentColor}1a`, color: accentColor } : undefined}
      className={tailwind(
        'mt-0.5 inline-block w-fit rounded-full px-2 py-0.5 text-xs',
        !accentColor && 'bg-ink-100 text-ink-600',
      )}
    >
      {name}
    </span>
  );
};

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
    monthFilter,
    actorOptions,
    actionOptions,
    monthOptions,
    branchFilter,
    branchOptions,
    typeFilter,
    typeOptions,
    todaySummary,
    monthSummary,
    resolveBranchName,
    setSearchTerm,
    handleScopeChange,
    handleActorFilter,
    handleActionFilter,
    handleMonthFilter,
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
            <BranchPill
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
    {
      key: 'month',
      label: t(TEXT.ACTIVITY.FILTERS.MONTH_LABEL),
      ariaLabel: t(TEXT.ACTIVITY.FILTERS.MONTH_ARIA),
      value: monthFilter,
      options: monthOptions,
      allValue: ALL_VALUE,
      inline: true,
      onChange: handleMonthFilter,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* En móvil las tarjetas van en una fila con scroll lateral para no
          ocupar media pantalla antes del primer registro. */}
      <div className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-4 md:gap-3 md:overflow-visible md:px-0 md:pb-0 [&>*]:min-w-[46%] [&>*]:snap-start md:[&>*]:min-w-0">
        <SummaryCard
          label={t(TEXT.ACTIVITY.SUMMARY.TODAY)}
          value={todaySummary?.total}
          hint={formatActorBreakdown(t, todaySummary)}
        />
        <SummaryCard
          label={t(TEXT.ACTIVITY.SUMMARY.CONFIRMED_THIS_MONTH)}
          value={monthSummary ? (monthSummary.byAction.APPOINTMENT_CONFIRMED ?? 0) : undefined}
        />
        <SummaryCard
          label={t(TEXT.ACTIVITY.SUMMARY.TENTATIVE_THIS_MONTH)}
          value={monthSummary ? (monthSummary.byAction.APPOINTMENT_TENTATIVE ?? 0) : undefined}
        />
        <SummaryCard
          label={t(TEXT.ACTIVITY.SUMMARY.NEW_PATIENTS_THIS_MONTH)}
          value={monthSummary ? (monthSummary.byAction.PATIENT_CREATED ?? 0) : undefined}
        />
      </div>

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
