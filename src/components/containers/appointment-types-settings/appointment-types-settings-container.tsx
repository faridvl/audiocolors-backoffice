import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { SettingsAddButton } from '../settings/settings-add-button';
import { SettingsCard } from '../settings/settings-card';
import { SettingsSectionError, SettingsSectionLoading } from '../settings/settings-section-state';
import { AppointmentTypeListRow } from './appointment-type-list-row';
import { EditAppointmentTypeModal } from './edit-appointment-type-modal';
import { useAppointmentTypesSettings } from './use-appointment-types-settings';

const NEW_TYPE_KEY = 'new-appointment-type';

export const AppointmentTypesSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    appointmentTypes,
    currentControl,
    editingType,
    isAdding,
    isLoading,
    isError,
    refetch,
    isSaving,
    handleEdit,
    handleCloseEdit,
    handleSave,
    handleCreate,
    handleAdd,
  } = useAppointmentTypesSettings();

  if (isLoading) {
    return <SettingsSectionLoading message={t(TEXT.SETTINGS.APPOINTMENT_TYPES.LOADING)} />;
  }

  if (isError) {
    return (
      <SettingsSectionError
        message={t(TEXT.SETTINGS.APPOINTMENT_TYPES.LOAD_ERROR)}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <SettingsAddButton label={t(TEXT.SETTINGS.APPOINTMENT_TYPES.ADD)} onClick={handleAdd} />

      {appointmentTypes.length === 0 ? (
        <Typography variant={TypographyVariant.BODY} className="py-2 text-ink-500">
          {t(TEXT.SETTINGS.APPOINTMENT_TYPES.EMPTY)}
        </Typography>
      ) : (
        <SettingsCard hasPadding={false}>
          <ul className="[&>li:last-child>button]:border-b-0">
            {appointmentTypes.map((appointmentType) => (
              <AppointmentTypeListRow
                key={appointmentType.uuid}
                appointmentType={appointmentType}
                onEdit={() => handleEdit(appointmentType.uuid)}
              />
            ))}
          </ul>
        </SettingsCard>
      )}

      {(editingType || isAdding) && (
        <EditAppointmentTypeModal
          key={editingType?.uuid ?? NEW_TYPE_KEY}
          appointmentType={editingType}
          currentControl={currentControl}
          existingNames={appointmentTypes
            .filter((type) => type.uuid !== editingType?.uuid)
            .map((type) => type.name)}
          isSaving={isSaving}
          onSave={handleSave}
          onCreate={handleCreate}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};
