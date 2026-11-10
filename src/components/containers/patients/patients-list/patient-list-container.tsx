import React, { useMemo } from "react";
import { formatPhoneForDisplay } from "@/shared/utils/phone";
import { Search, Pencil, X } from "lucide-react";
import {
  getPatientBranchUuids,
  Patient,
  PatientFlag,
} from "@/types/patients/patient";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { TEXT } from "@/static/texts/i18n";
import { Branch } from "@/types/branches/branch";
import {
  ResponsiveTable,
  TableColumn,
} from "@/components/common/table/responsive-table";
import { Pagination } from "@/components/common/table/pagination";
import { LabDateField } from "@/components/containers/patients/patient-flags/lab-date-field";
import { PatientPriorityButton } from "./patient-priority-button";
import { Button, ButtonVariant } from "@/components/common/button/button";
import {
  Typography,
  TypographyVariant,
} from "@/components/common/typography/typography";
import { inputBaseClasses } from "@/components/common/input/input";
import { FilterBar } from "@/components/common/filter-bar/filter-bar";
import { PatientStatusPill } from "@/components/containers/patients/patient-status-pill";
import {
  PatientFlagPills,
  PatientFlagValue,
} from "@/components/containers/patients/patient-flags/patient-flag-pills";
import {
  EMPTY_VALUE,
  formatDate,
  formatMonthLabel,
  getFullName,
} from "@/shared/utils/formatters";
import { tailwind } from "@/utils/tailwind-utils";
import { getBranchStripeColor } from "@/shared/design/tokens";
import { useBranchesQuery } from "@/shared/api/querys/branches-query";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/shared/auth/permissions";
import { findBranch } from "@/shared/utils/branches";
import {
  usePatientList,
  ALL_VALUE,
  DEFAULT_STATUS_FILTER,
} from "./use-patient-list";
import { PatientSummaryCards } from "./patient-summary-cards";
import { BranchBadge } from "@/components/common/badge/branch-badge";
import { BadgeSize } from "@/components/common/badge/badge";

/** Indicadores que la lista muestra como chip bajo el nombre (la garantía es columna). */
const CHIP_FLAGS = [
  PatientFlag.HEARING_AIDS_IN_LAB,
  PatientFlag.VIDEO_CANDIDATE,
];

function buildColumns(
  branches: Branch[] | undefined,
  t: TFunction,
): TableColumn<Patient>[] {
  return [
    {
      key: "name",
      header: "Paciente",
      width: "32%",
      isCardTitle: true,
      render: (patient) => (
        <div className="flex flex-col">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Typography variant={TypographyVariant.BODY} inline>
              {getFullName(patient.firstName, patient.lastName)}
            </Typography>
            <PatientStatusPill status={patient.status} />
          </span>
          {/* La cédula va bajo el nombre: así no ocupa una columna propia. */}
          {(patient.documentId || patient.email) && (
            <Typography
              variant={TypographyVariant.HELPER}
              className="break-words"
            >
              {[patient.documentId, patient.email].filter(Boolean).join(" · ")}
            </Typography>
          )}
          {/* Audífonos y video no son columna: chips en su propia línea, solo si aplican. */}
          {(patient.hearingAidsInLabSince || patient.videoCandidateSince) && (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              <PatientFlagPills patient={patient} flags={CHIP_FLAGS} />
            </span>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      width: "16%",
      render: (patient) =>
        patient.phone ? formatPhoneForDisplay(patient.phone) : EMPTY_VALUE,
    },
    {
      key: "branch",
      header: t(TEXT.PATIENTS.FORM.BRANCHES_LABEL),
      width: "16%",
      render: (patient) => {
        const patientBranches = getPatientBranchUuids(patient)
          .map((branchUuid) => findBranch(branches, { uuid: branchUuid }))
          .filter((branch): branch is Branch => Boolean(branch));
        if (patientBranches.length === 0) return EMPTY_VALUE;
        return (
          <div className="flex flex-wrap gap-1">
            {patientBranches.map((branch) => (
              <BranchBadge
                key={branch.uuid}
                branch={branch}
                size={BadgeSize.REGULAR}
              />
            ))}
          </div>
        );
      },
    },
    {
      key: "nextAppointmentAt",
      header: "Próxima cita",
      width: "22%",
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
                  : "Por confirmar"}
              </Typography>
            </div>
          );
        }

        return EMPTY_VALUE;
      },
    },
    {
      key: PatientFlag.ACTIVE_WARRANTY,
      header: t(
        `${TEXT.PATIENTS.FLAGS.COLUMN_PREFIX}.${PatientFlag.ACTIVE_WARRANTY}`,
      ),
      width: "14%",
      render: (patient: Patient) => (
        <PatientFlagValue
          patient={patient}
          flag={PatientFlag.ACTIVE_WARRANTY}
        />
      ),
    },
  ];
}

export const PatientListContainer: React.FC = () => {
  const {
    patients,
    meta,
    searchTerm,
    monthFilter,
    appointmentMonthOptions,
    statusFilter,
    statusOptions,
    branchFilter,
    branchOptions,
    appointmentTypeFilter,
    appointmentTypeOptions,
    flagFilter,
    flagOptions,
    kindFilter,
    kindOptions,
    isLoading,
    isError,
    page,
    hasActiveFilters,
    setSearchTerm,
    handleMonthFilter,
    handleStatusFilter,
    handleBranchFilter,
    handleAppointmentTypeFilter,
    handleFlagFilter,
    labDate,
    isLabFilterOn,
    todayKey,
    handleLabDate,
    handleKindFilter,
    selection,
    isPresetActive,
    togglePreset,
    handlePageChange,
    handleRetry,
    navigateToCreate,
    navigateToDetail,
    navigateToEdit,
  } = usePatientList();

  const { data: branches } = useBranchesQuery();
  const { t } = useTranslation();
  const { can } = usePermissions();
  const columns = useMemo(() => buildColumns(branches, t), [branches, t]);
  const getRowAccentColor = (patient: Patient) =>
    getBranchStripeColor(
      findBranch(branches, { uuid: getPatientBranchUuids(patient)[0] })?.color,
    );

  const createButton = (
    <Button
      variant={ButtonVariant.PRIMARY}
      onClick={navigateToCreate}
      className="w-full sm:w-auto"
    >
      Nuevo paciente
    </Button>
  );

  return (
    <div className="flex flex-col gap-4">
      <PatientSummaryCards
        selection={selection}
        isPresetActive={isPresetActive}
        onTogglePreset={togglePreset}
      />

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
                className={tailwind(inputBaseClasses, "pl-9")}
              />
            </div>
          }
          fields={[
            {
              key: "status",
              label: "Estado",
              values: statusFilter,
              defaultValues: DEFAULT_STATUS_FILTER,
              options: statusOptions,
              allValue: ALL_VALUE,
              onValuesChange: handleStatusFilter,
            },
            {
              key: "branch",
              label: "Sede",
              values: branchFilter,
              options: branchOptions,
              allValue: ALL_VALUE,
              onValuesChange: handleBranchFilter,
            },
            {
              key: "appointmentType",
              label: "Tipo de cita",
              values: appointmentTypeFilter,
              options: appointmentTypeOptions,
              allValue: ALL_VALUE,
              onValuesChange: handleAppointmentTypeFilter,
            },
            {
              key: "kind",
              label: "Próxima cita",
              values: kindFilter,
              options: kindOptions,
              allValue: ALL_VALUE,
              onValuesChange: handleKindFilter,
            },
            {
              key: "flags",
              label: "Indicadores",
              values: flagFilter,
              options: flagOptions,
              allValue: ALL_VALUE,
              onValuesChange: handleFlagFilter,
            },
            {
              key: "month",
              label: "Próxima cita",
              ariaLabel: "Filtrar por mes de próxima cita",
              inline: true,
              values: monthFilter,
              options: appointmentMonthOptions,
              allValue: ALL_VALUE,
              onValuesChange: handleMonthFilter,
            },
          ]}
          trailing={createButton}
          resultCount={meta?.total}
        />

        {isLabFilterOn && (
          <div className="flex flex-wrap items-end gap-2">
            <LabDateField
              id="patient-list-lab-date"
              label={t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.FILTER_DAY_LABEL)}
              value={labDate}
              max={todayKey}
              onChange={handleLabDate}
            />
            {labDate && (
              <Button
                variant={ButtonVariant.GHOST}
                onClick={() => handleLabDate("")}
                icon={<X className="h-4 w-4" aria-hidden />}
                className="h-[46px]"
              >
                {t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.FILTER_DAY_CLEAR)}
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && !!meta?.total && (
          <Typography variant={TypographyVariant.HELPER}>
            {meta.total} {meta.total === 1 ? "paciente" : "pacientes"}
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
          cardTitleClassName="pr-20"
          rowActions={(patient) => (
            <div className="flex items-center justify-end gap-2">
              <PatientPriorityButton patient={patient} />
              {can(Permission.EDIT_PATIENT) && (
                <Button
                  variant={ButtonVariant.GHOST}
                  onClick={() => navigateToEdit(patient.uuid)}
                  aria-label={`Editar ${getFullName(patient.firstName, patient.lastName)}`}
                  className="min-h-[44px] min-w-[44px] px-2 py-1.5"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>
              )}
            </div>
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
    </div>
  );
};
