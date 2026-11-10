import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/api-service-client';
import { useCreateBranchMutation } from '@/shared/api/mutations/branches/create-branch-mutation';
import { useUpdateBranchMutation } from '@/shared/api/mutations/branches/update-branch-mutation';
import { FETCH_BRANCHES_KEY, useBranchesQuery } from '@/shared/api/querys/branches-query';
import { pickDefaultBranchColor } from '@/shared/utils/branches';
import { TEXT } from '@/static/texts/i18n';
import { Branch, CreateBranchPayload, UpdateBranchPayload } from '@/types/branches/branch';

/** Un guardado de la ventana: el hook de la lista decide a qué pantalla avisa y qué invalida. */
export interface BranchSaveCallbacks {
  onSuccess: () => void;
  onError: (error: Error) => void;
}

const HTTP_CONFLICT = 409;

export function useBranchesSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useBranchesQuery();
  const { executeCreateBranch, isPending: isCreating } = useCreateBranchMutation();
  const { executeUpdateBranch, isPending: isUpdating } = useUpdateBranchMutation();
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [changingUuid, setChangingUuid] = useState<string | null>(null);
  const [deactivatingUuid, setDeactivatingUuid] = useState<string | null>(null);

  const branches = data ?? [];
  const editingBranch = branches.find((branch) => branch.uuid === editingUuid) ?? null;
  const deactivatingBranch = branches.find((branch) => branch.uuid === deactivatingUuid) ?? null;

  const activeBranches = branches.filter((branch) => branch.isActive);
  const lastActiveUuid = activeBranches.length === 1 ? activeBranches[0].uuid : null;

  const refreshBranches = () => queryClient.invalidateQueries({ queryKey: [FETCH_BRANCHES_KEY] });

  const handleCreate = (payload: CreateBranchPayload, callbacks: BranchSaveCallbacks) => {
    executeCreateBranch(payload, {
      onSuccess: () => {
        toast.success(t(TEXT.SETTINGS.BRANCHES.CREATED));
        void refreshBranches();
        setIsAdding(false);
        callbacks.onSuccess();
      },
      onError: callbacks.onError,
    });
  };

  const handleUpdate = (
    branchUuid: string,
    changes: UpdateBranchPayload,
    callbacks: BranchSaveCallbacks,
  ) => {
    executeUpdateBranch(
      { branchUuid, changes },
      {
        onSuccess: () => {
          toast.success(t(TEXT.SETTINGS.BRANCHES.SAVED));
          void refreshBranches();
          setEditingUuid(null);
          callbacks.onSuccess();
        },
        onError: callbacks.onError,
      },
    );
  };

  const changeActive = (branch: Branch, isActive: boolean, onDone?: () => void) => {
    setChangingUuid(branch.uuid);
    executeUpdateBranch(
      { branchUuid: branch.uuid, changes: { isActive } },
      {
        onSuccess: () => {
          toast.success(
            t(isActive ? TEXT.SETTINGS.BRANCHES.REACTIVATED : TEXT.SETTINGS.BRANCHES.DEACTIVATED),
          );
          void refreshBranches();
        },
        onError: (error: Error) => {
          const isLastActive = error instanceof ApiError && error.status === HTTP_CONFLICT;
          toast.error(isLastActive ? t(TEXT.SETTINGS.BRANCHES.LAST_ACTIVE_BRANCH) : error.message);
        },
        onSettled: () => {
          setChangingUuid(null);
          onDone?.();
        },
      },
    );
  };

  return {
    branches,
    isLoading,
    isError,
    refetch,
    editingBranch,
    isAdding,
    defaultColor: pickDefaultBranchColor(branches),
    lastActiveUuid,
    deactivatingBranch,
    changingUuid,
    isSaving: isCreating || isUpdating,
    handleAdd: () => setIsAdding(true),
    handleEdit: setEditingUuid,
    handleCloseModal: () => {
      setEditingUuid(null);
      setIsAdding(false);
    },
    handleCreate,
    handleUpdate,
    handleRequestDeactivate: (branch: Branch) => {
      if (branch.uuid === lastActiveUuid) return;
      setDeactivatingUuid(branch.uuid);
    },
    handleCancelDeactivate: () => setDeactivatingUuid(null),
    handleConfirmDeactivate: () => {
      if (deactivatingBranch) {
        changeActive(deactivatingBranch, false, () => setDeactivatingUuid(null));
      }
    },
    handleReactivate: (branch: Branch) => changeActive(branch, true),
  };
}
