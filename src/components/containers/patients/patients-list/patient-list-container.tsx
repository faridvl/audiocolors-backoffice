import React from 'react';
import { Search, Plus, Pencil } from 'lucide-react';
import { Patient } from '@/types/patients/patient';
import { PatientStatusFilter } from '@/shared/api/querys/patients-query';
import { Table, TableColumn } from '@/components/common/table/table';
import { Pagination } from '@/components/common/table/pagination';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { formatDate, getFullName } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { usePatientList, STATUS_FILTER_OPTIONS } from './use-patient-list';

const columns: TableColumn<Patient>[] = [
  {
    key: 'name',
    header: 'Paciente',
    width: '32%',
    render: (patient) => (
      <div className="flex flex-col">
        <Typography variant={TypographyVariant.BODY_STRONG}>
          {getFullName(patient.firstName, patient.lastName)}
        </Typography>
        {patient.email && (
          <Typography variant={TypographyVariant.CAPTION}>{patient.email}</Typography>
        )}
      </div>
    ),
  },
  {
    key: 'documentId',
    header: 'Cedula',
    width: '18%',
    render: (patient) => patient.documentId || '—',
  },
  {
    key: 'phone',
    header: 'Telefono',
    width: '18%',
    render: (patient) => patient.phone || '—',
  },
  {
    key: 'createdAt',
    header: 'Registro',
    width: '16%',
    hideOnMobile: true,
    render: (patient) => formatDate(patient.createdAt),
  },
  {
    key: 'status',
    header: 'Estado',
    width: '12%',
    render: (patient) =>
      patient.isActive ? (
        <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          Activo
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-navy-100 px-2 py-0.5 text-xs font-medium text-navy-500">
          Inactivo
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
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleStatusFilter,
    handlePageChange,
    handleRetry,
    navigateToCreate,
    navigateToDetail,
    navigateToEdit,
  } = usePatientList();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre o cedula"
            aria-label="Buscar pacientes"
            className={tailwind(inputBaseClasses, 'pl-9')}
          />
        </div>

        <div className="flex items-center gap-2" role="group" aria-label="Filtrar por estado">
          {STATUS_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleStatusFilter(option.value)}
              className={tailwind(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === option.value
                  ? 'bg-brand text-white'
                  : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        rows={patients}
        getRowKey={(patient) => patient.uuid}
        isLoading={isLoading}
        isError={isError}
        onRetry={handleRetry}
        onRowClick={(patient) => navigateToDetail(patient.uuid)}
        errorTitle="No se pudieron cargar los pacientes"
        emptyTitle={
          hasActiveFilters ? 'Sin resultados para tu busqueda' : 'Aun no hay pacientes registrados'
        }
        emptyDescription={
          hasActiveFilters
            ? 'Prueba con otro nombre o cedula, o cambia el filtro de estado.'
            : 'Registra el primer paciente para comenzar.'
        }
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

      {!isLoading && !patients.length && !hasActiveFilters && (
        <div className="flex justify-center">
          <Button
            variant={ButtonVariant.PRIMARY}
            onClick={navigateToCreate}
            icon={<Plus className="h-4 w-4" aria-hidden />}
          >
            Nuevo paciente
          </Button>
        </div>
      )}
    </div>
  );
};
