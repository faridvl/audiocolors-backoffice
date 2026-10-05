import React, { useMemo } from 'react';
import { Search, Pencil } from 'lucide-react';
import { Patient } from '@/types/patients/patient';
import { Branch } from '@/types/branches/branch';
import { ResponsiveTable, TableColumn } from '@/components/common/table/responsive-table';
import { Pagination } from '@/components/common/table/pagination';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { FilterBar } from '@/components/common/filter-bar/filter-bar';
import { PatientStatusPill } from '@/components/containers/patients/patient-status-pill';
import { EMPTY_VALUE, formatDate, formatMonthLabel, getFullName } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { getBranchStripeColor } from '@/shared/design/tokens';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import { usePatientList, ALL_VALUE, DEFAULT_STATUS_FILTER } from './use-patient-list';
import { BranchBadge } from '@/components/common/badge/branch-badge';
import { BadgeSize } from '@/components/common/badge/badge';

function buildColumns(branches: Branch[] | undefined): TableColumn<Patient>[] {
  return [
    {
      key: 'name',
      header: 'Paciente',
      width: '32%',
      isCardTitle: true,
      render: (patient) => (
        <div className="flex flex-col">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Typography variant={TypographyVariant.BODY} inline>
              {getFullName(patient.firstName, patient.lastName)}
            </Typography>
            <PatientStatusPill status={patient.status} />
          </span>
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
      render: (patient) => {
        const branchName = branches?.find((branch) => branch.uuid === patient.branchUuid)?.name;
        if (!branchName) return EMPTY_VALUE;
        return <BranchBadge name={branchName} size={BadgeSize.REGULAR} />;
      },
    },
    {
      key: 'nextAppointmentAt',
      header: 'Próxima cita',
      width: '15%',
      // Con dia confirmado se muestra la fecha y debajo de que es la cita; si
      // solo hay mes tentativo se muestra atenuado, para distinguir de un
      // vistazo a quien todavia hay que llamar.
      render: (patient) => {
        if (patient.nextAppointmentAt) {
          return (
            <div className="flex flex-col">
              <Typography variant={TypographyVariant.BODY}>
                {formatDate(patient.nextAppointmentAt)}
              </Typography>
              {patient.nextAppointmentType && (
                <Typography variant={TypographyVariant.HELPER}>
                  {patient.nextAppointmentType}
                </Typography>
              )}
            </div>
          );
        }

        if (patient.tentativeAppointmentMonth) {
          return (
            <div className="flex flex-col text-ink-500">
              <Typography variant={TypographyVariant.BODY}>
                {formatMonthLabel(patient.tentativeAppointmentMonth)}
              </Typography>
              <Typography variant={TypographyVariant.HELPER}>
                {patient.tentativeAppointmentTypeName
                  ? `${patient.tentativeAppointmentTypeName} · Por confirmar`
                  : 'Por confirmar'}
              </Typography>
            </div>
          );
        }

        return '—';
      },
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
    statusFilter,
    statusOptions,
    branchFilter,
    branchOptions,
    appointmentTypeFilter,
    appointmentTypeOptions,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleAppointmentMonthFilter,
    handleStatusFilter,
    handleBranchFilter,
    handleAppointmentTypeFilter,
    handlePageChange,
    handleRetry,
    navigateToCreate,
    navigateToDetail,
    navigateToEdit,
  } = usePatientList();

  const { data: branches } = useBranchesQuery();
  const columns = useMemo(() => buildColumns(branches), [branches]);
  const getRowAccentColor = (patient: Patient) =>
    getBranchStripeColor(branches?.find((branch) => branch.uuid === patient.branchUuid)?.name);

  const createButton = (
    <Button variant={ButtonVariant.PRIMARY} onClick={navigateToCreate} className="w-full sm:w-auto">
      Nuevo paciente
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        leading={
          <div className="relative w-full lg:w-72">
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
        }
        fields={[
          {
            key: 'status',
            label: 'Estado',
            value: statusFilter,
            options: statusOptions,
            allValue: ALL_VALUE,
            defaultValue: DEFAULT_STATUS_FILTER,
            onChange: handleStatusFilter,
          },
          {
            key: 'branch',
            label: 'Sede',
            value: branchFilter,
            options: branchOptions,
            allValue: ALL_VALUE,
            onChange: handleBranchFilter,
          },
          {
            key: 'appointmentType',
            label: 'Tipo de cita',
            value: appointmentTypeFilter,
            options: appointmentTypeOptions,
            allValue: ALL_VALUE,
            onChange: handleAppointmentTypeFilter,
          },
          {
            key: 'month',
            label: 'Próxima cita',
            ariaLabel: 'Filtrar por mes de próxima cita',
            inline: true,
            value: appointmentMonthFilter,
            options: appointmentMonthOptions,
            allValue: ALL_VALUE,
            onChange: handleAppointmentMonthFilter,
          },
        ]}
        trailing={createButton}
        resultCount={meta?.total}
      />

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
        rowAccentColor={getRowAccentColor}
        errorTitle="No se pudieron cargar los pacientes"
        emptyTitle="Aún no hay pacientes registrados"
        emptyDescription="Registra el primer paciente para comenzar."
        emptyAction={createButton}
        noResultsTitle="Sin resultados para tu búsqueda"
        noResultsDescription="Prueba con otro nombre o cédula, o cambia los filtros."
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
