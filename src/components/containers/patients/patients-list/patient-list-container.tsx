import React, { useMemo } from 'react';
import { Search, Pencil } from 'lucide-react';
import { Patient } from '@/types/patients/patient';
import { Branch } from '@/types/branches/branch';
import { ResponsiveTable, TableColumn } from '@/components/common/table/responsive-table';
import { Pagination } from '@/components/common/table/pagination';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { FilterDropdown } from '@/components/common/filter-dropdown/filter-dropdown';
import { formatDate, getFullName } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { usePatientList, ALL_VALUE } from './use-patient-list';

function buildColumns(branches: Branch[] | undefined): TableColumn<Patient>[] {
  return [
    {
      key: 'name',
      header: 'Paciente',
      width: '32%',
      isCardTitle: true,
      render: (patient) => (
        <div className="flex flex-col">
          <Typography variant={TypographyVariant.BODY}>
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
      key: 'branch',
      header: 'Sede',
      width: '17%',
      render: (patient) =>
        branches?.find((branch) => branch.uuid === patient.branchUuid)?.name ?? '—',
    },
    {
      key: 'nextAppointmentAt',
      header: 'Próxima cita',
      width: '15%',
      render: (patient) => formatDate(patient.nextAppointmentAt ?? undefined),
    },
  ];
}

export const PatientListContainer: React.FC = () => {
  const {
    patients,
    meta,
    searchTerm,
    appointmentMonthFilter,
    appointmentMonthOptions,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleAppointmentMonthFilter,
    handlePageChange,
    handleRetry,
    navigateToCreate,
    navigateToDetail,
    navigateToEdit,
  } = usePatientList();

  const { data: branches } = useBranchesQuery();
  const columns = useMemo(() => buildColumns(branches), [branches]);

  const createButton = (
    <Button variant={ButtonVariant.PRIMARY} onClick={navigateToCreate} className="w-full sm:w-auto">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end xl:gap-4">
          <div className="flex flex-col gap-1.5">
            <Typography variant={TypographyVariant.HELPER} className="text-ink-500">
              Filtrar por próxima cita
            </Typography>

            <FilterDropdown
              value={appointmentMonthFilter}
              options={appointmentMonthOptions}
              allValue={ALL_VALUE}
              onChange={handleAppointmentMonthFilter}
              ariaLabel="Filtrar por mes de próxima cita"
              placeholderLabel="Mes"
              className="w-full sm:w-auto"
            />
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
        noResultsDescription="Prueba con otro nombre o cédula, o cambia el filtro de próxima cita."
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
