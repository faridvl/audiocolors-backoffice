import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatEquipmentName } from '@/shared/utils/equipment';
import { TEXT } from '@/static/texts/i18n';
import { SettingsAddButton } from '../settings/settings-add-button';
import { SettingsCard } from '../settings/settings-card';
import { SettingsSectionError, SettingsSectionLoading } from '../settings/settings-section-state';
import { EditEquipmentModal } from './edit-equipment-modal';
import { EquipmentListRow } from './equipment-list-row';
import { useEquipmentSettings } from './use-equipment-settings';

const NEW_EQUIPMENT_KEY = 'new-equipment';

export const EquipmentSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    equipment,
    isLoading,
    isError,
    refetch,
    editingEquipment,
    isAdding,
    deactivatingEquipment,
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
  } = useEquipmentSettings();

  const isEmpty = !isLoading && !isError && equipment.length === 0;
  const addButton = (
    <SettingsAddButton
      label={t(TEXT.SETTINGS.EQUIPMENT.ADD)}
      onClick={handleAdd}
      disabled={isLoading || isError}
    />
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {!isEmpty && addButton}

      {isLoading ? (
        <SettingsCard>
          <SettingsSectionLoading message={t(TEXT.SETTINGS.EQUIPMENT.LOADING)} />
        </SettingsCard>
      ) : isError ? (
        <SettingsCard>
          <SettingsSectionError
            message={t(TEXT.SETTINGS.EQUIPMENT.LOAD_ERROR)}
            onRetry={() => refetch()}
          />
        </SettingsCard>
      ) : isEmpty ? (
        <SettingsCard className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
              {t(TEXT.SETTINGS.EQUIPMENT.EMPTY_TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="text-ink-500">
              {t(TEXT.SETTINGS.EQUIPMENT.EMPTY_HINT)}
            </Typography>
          </div>
          {addButton}
        </SettingsCard>
      ) : (
        <SettingsCard hasPadding={false}>
          <ul className="[&>li:last-child]:border-b-0">
            {equipment.map((item) => (
              <EquipmentListRow
                key={item.uuid}
                equipment={item}
                isChanging={changingUuid === item.uuid}
                onEdit={() => handleEdit(item.uuid)}
                onDeactivate={() => handleRequestDeactivate(item)}
                onReactivate={() => handleReactivate(item)}
              />
            ))}
          </ul>
        </SettingsCard>
      )}

      {(editingEquipment || isAdding) && (
        <EditEquipmentModal
          key={editingEquipment?.uuid ?? NEW_EQUIPMENT_KEY}
          equipment={editingEquipment}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          isSaving={isSaving}
          onClose={handleCloseModal}
        />
      )}

      {deactivatingEquipment && (
        <ConfirmDialog
          title={t(TEXT.SETTINGS.EQUIPMENT.DEACTIVATE_TITLE, {
            name: formatEquipmentName(deactivatingEquipment),
          })}
          message={t(TEXT.SETTINGS.EQUIPMENT.DEACTIVATE_MESSAGE)}
          confirmLabel={t(TEXT.SETTINGS.EQUIPMENT.DEACTIVATE)}
          cancelLabel={t(TEXT.GENERAL.BUTTONS.CANCEL)}
          onConfirm={handleConfirmDeactivate}
          onCancel={handleCancelDeactivate}
          isDanger
          isConfirming={changingUuid === deactivatingEquipment.uuid}
        />
      )}
    </div>
  );
};
