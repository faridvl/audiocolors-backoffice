import React from 'react';
import { Search, Plus, Pencil, CalendarDays } from 'lucide-react';
import { Patient } from '@/types/patients/patient';
import { ResponsiveTable, TableColumn } from '@/components/common/table/responsive-table';
import { Pagination } from '@/components/common/table/pagination';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { formatDate, getFullName } from '@/shared/utils/formatters';
import { STATUS_STYLES, StatusTone } from '@/shared/design/tokens';
import { tailwind } from '@/utils/tailwind-utils';
import {
  usePatientList,
  STATUS_FILTER_OPTIONS,
  MONTH_FILTER_OPTIONS,
  YEAR_FILTER_OPTIONS,
} from './use-patient-list';

const columns: TableColumn<Patient>[] = [
  {
    key: 'name',
    header: 'Paciente',
    width: '32%',
    isCardTitle: true,
    render: (patient) => (
      <div className="flex flex-col">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
          {getFullName(patient.firstName, patient.lastName)}
        </Typography>
        {patient.email && (
          <Typography variant={TypographyVariant.HELPER}>{patient.email}</Typography>
        )}
      </div>
    ),
  },
  {
    key: 'documentId',
    header: 'Cédula',
    width: '18%',
    render: (patient) => patient.documentId || '—',
  },
  {
    key: 'phone',
    header: 'Teléfono',
    width: '18%',
    render: (patient) => patient.phone || '—',
  },
  {
    key: 'nextAppointmentAt',
    header: 'Próxima cita',
    width: '15%',
    render: (patient) => formatDate(patient.nextAppointmentAt ?? undefined),
  },
  {
    key: 'status',
    header: 'Estado',
    width: '12%',
    render: (patient) => (
      <span
        className={tailwind(
          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
          STATUS_STYLES[patient.isActive ? StatusTone.ACTIVE : StatusTone.INACTIVE],
        )}
      >
        {patient.isActive ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

export const PatientListContainer: React.FC = () => {
  const {
    patients,
    meta,
    searchTerm,
    statusFilter,
    monthFilter,
    yearFilter,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleStatusFilter,
    handleMonthFilter,
    handleYearFilter,
    handlePageChange,
    handleRetry,
    navigateToCreate,
    navigateToDetail,
    navigateToEdit,
  } = usePatientList();

  const createButton = (
    <Button
      variant={ButtonVariant.PRIMARY}
      onClick={navigateToCreate}
      icon={<Plus className="h-4 w-4" aria-hidden />}
      className="w-full sm:w-auto"
    >
      Nuevo paciente
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative xl:max-w-xs xl:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre o cédula"
            aria-label="Buscar pacientes"
            className={tailwind(inputBaseClasses, 'pl-9')}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end xl:gap-4">
          <div className="flex items-center gap-1" role="group" aria-label="Filtrar por estado">
            {STATUS_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={statusFilter === option.value}
                onClick={() => handleStatusFilter(option.value)}
                className={tailwind(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  statusFilter === option.value
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 sm:gap-1">
            <Typography
              variant={TypographyVariant.HELPER}
              className="flex items-center gap-1 text-ink-500"
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Próxima cita: mes y año
            </Typography>

            <div className="flex items-center gap-2">
              <select
                value={monthFilter}
                onChange={(event) => handleMonthFilter(event.target.value)}
                aria-label="Filtrar por mes de próxima cita"
                className={tailwind(inputBaseClasses, 'w-auto')}
              >
                {MONTH_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(event) => handleYearFilter(event.target.value)}
                aria-label="Filtrar por año de próxima cita"
                className={tailwind(inputBaseClasses, 'w-auto')}
              >
                {YEAR_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {createButton}
        </div>
      </div>

      {!isLoading && !isError && !!meta?.total && (
        <Typography variant={TypographyVariant.HELPER}>
          {meta.total} {meta.total === 1 ? 'paciente' : 'pacientes'}
        </Typography>
      )}

      <ResponsiveTable
        columns={columns}
        rows={patients}
        getRowKey={(patient) => patient.uuid}
        isLoading={isLoading}
        isError={isError}
        hasActiveFilters={hasActiveFilters}
        onRetry={handleRetry}
        onRowClick={(patient) => navigateToDetail(patient.uuid)}
        errorTitle="No se pudieron cargar los pacientes"
        emptyTitle="Aún no hay pacientes registrados"
        emptyDescription="Registra el primer paciente para comenzar."
        emptyAction={createButton}
        noResultsTitle="Sin resultados para tu búsqueda"
        noResultsDescription="Prueba con otro nombre o cédula, o cambia el filtro de estado, mes o año."
        rowActions={(patient) => (
          <Button
            variant={ButtonVariant.GHOST}
            onClick={() => navigateToEdit(patient.uuid)}
            aria-label={`Editar ${getFullName(patient.firstName, patient.lastName)}`}
            className="px-2 py-1.5"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
        )}
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
