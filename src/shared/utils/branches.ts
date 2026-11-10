import type { TFunction } from 'i18next';
import { TEXT } from '@/static/texts/i18n';
import { Branch, BRANCH_COLORS, BranchColor, DEFAULT_BRANCH_COLOR } from '@/types/branches/branch';

/** Sedes con las que se puede registrar o agendar algo nuevo. */
export const getActiveBranches = (branches: Branch[] | undefined): Branch[] =>
  (branches ?? []).filter((branch) => branch.isActive);

/**
 * Opciones de un selector: las activas, más las inactivas que ya están elegidas
 * (un paciente conserva su sede aunque la clínica la haya desactivado).
 */
export const getSelectableBranches = (
  branches: Branch[] | undefined,
  selectedUuids: string[] = [],
): Branch[] =>
  (branches ?? []).filter((branch) => branch.isActive || selectedUuids.includes(branch.uuid));

/** Busca la sede por uuid; si solo se tiene el nombre (datos viejos), por nombre. */
export const findBranch = (
  branches: Branch[] | undefined,
  reference: { uuid?: string | null; name?: string | null },
): Branch | undefined => {
  if (!branches) return undefined;
  if (reference.uuid) return branches.find((branch) => branch.uuid === reference.uuid);
  if (reference.name) return branches.find((branch) => branch.name === reference.name);
  return undefined;
};

/** El primer color que ninguna sede activa usa; si todos se usan, el azul. */
export const pickDefaultBranchColor = (branches: Branch[] | undefined): BranchColor => {
  const used = new Set(getActiveBranches(branches).map((branch) => branch.color));
  return BRANCH_COLORS.find((color) => !used.has(color)) ?? DEFAULT_BRANCH_COLOR;
};

/** Nombre de una sede en un selector o filtro; las inactivas llevan la marca. */
export const getBranchOptionLabel = (branch: Branch, t: TFunction): string =>
  branch.isActive ? branch.name : t(TEXT.BRANCHES.INACTIVE_OPTION, { name: branch.name });

/**
 * Sede con la que se crea algo nuevo para el paciente: la preferida si la tiene y sigue
 * activa; si no, la primera suya que esté activa. Sin sedes cargadas no se descarta ninguna.
 */
export const pickActiveBranchUuid = (
  patientBranchUuids: string[],
  branches: Branch[] | undefined,
  preferredUuid?: string | null,
): string | undefined => {
  const offered = branches
    ? patientBranchUuids.filter((uuid) => getActiveBranches(branches).some((b) => b.uuid === uuid))
    : patientBranchUuids;
  if (preferredUuid && offered.includes(preferredUuid)) return preferredUuid;
  return offered[0];
};
