import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { SettingsAddButton } from '../settings/settings-add-button';
import { SettingsCard } from '../settings/settings-card';
import { SettingsSectionError, SettingsSectionLoading } from '../settings/settings-section-state';
import { BranchListRow } from './branch-list-row';
import { EditBranchModal } from './edit-branch-modal';
import { useBranchesSettings } from './use-branches-settings';

const NEW_BRANCH_KEY = 'new-branch';

export const BranchesSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    branches,
    isLoading,
    isError,
    refetch,
    editingBranch,
    isAdding,
    defaultColor,
    lastActiveUuid,
    deactivatingBranch,
    changingUuid,
    isSaving,
    handleAdd,
    handleEdit,
    handleCloseModal,
    handleCreate,
    handleUpdate,
    handleRequestDeactivate,
    handleCancelDeactivate,
    handleConfirmDeactivate,
    handleReactivate,
  } = useBranchesSettings();

  return (
    <div className="flex w-full flex-col gap-4">
      <SettingsAddButton
        label={t(TEXT.SETTINGS.BRANCHES.ADD)}
        onClick={handleAdd}
        disabled={isLoading || isError}
      />

      {isLoading ? (
        <SettingsCard>
          <SettingsSectionLoading message={t(TEXT.SETTINGS.BRANCHES.LOADING)} />
        </SettingsCard>
      ) : isError ? (
        <SettingsCard>
          <SettingsSectionError
            message={t(TEXT.SETTINGS.BRANCHES.LOAD_ERROR)}
            onRetry={() => refetch()}
          />
        </SettingsCard>
      ) : branches.length === 0 ? (
        <div className="flex flex-col gap-1 py-2">
          <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
            {t(TEXT.SETTINGS.BRANCHES.EMPTY_TITLE)}
          </Typography>
          <Typography variant={TypographyVariant.BODY} className="text-ink-500">
            {t(TEXT.SETTINGS.BRANCHES.EMPTY_HINT)}
          </Typography>
        </div>
      ) : (
        <SettingsCard hasPadding={false}>
          <ul className="[&>li:last-child]:border-b-0">
            {branches.map((branch) => (
              <BranchListRow
                key={branch.uuid}
                branch={branch}
                isChanging={changingUuid === branch.uuid}
                isLastActive={branch.uuid === lastActiveUuid}
                onEdit={() => handleEdit(branch.uuid)}
                onDeactivate={() => handleRequestDeactivate(branch)}
                onReactivate={() => handleReactivate(branch)}
              />
            ))}
          </ul>
        </SettingsCard>
      )}

      {(editingBranch || isAdding) && (
        <EditBranchModal
          key={editingBranch?.uuid ?? NEW_BRANCH_KEY}
          branch={editingBranch}
          defaultColor={defaultColor}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          isSaving={isSaving}
          onClose={handleCloseModal}
        />
      )}

      {deactivatingBranch && (
        <ConfirmDialog
          title={t(TEXT.SETTINGS.BRANCHES.DEACTIVATE_TITLE, { name: deactivatingBranch.name })}
          message={t(TEXT.SETTINGS.BRANCHES.DEACTIVATE_MESSAGE)}
          confirmLabel={t(TEXT.SETTINGS.BRANCHES.DEACTIVATE)}
          cancelLabel={t(TEXT.GENERAL.BUTTONS.CANCEL)}
          onConfirm={handleConfirmDeactivate}
          onCancel={handleCancelDeactivate}
          isDanger
          isConfirming={changingUuid === deactivatingBranch.uuid}
        />
      )}
    </div>
  );
};
