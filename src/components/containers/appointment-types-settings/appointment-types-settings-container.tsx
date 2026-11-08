import React from 'react';
import { AlertTriangle, Loader2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
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
    return (
      <div className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden />
        <Typography variant={TypographyVariant.BODY}>
          {t(TEXT.SETTINGS.APPOINTMENT_TYPES.LOADING)}
        </Typography>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
        <Typography variant={TypographyVariant.ACCENT}>
          {t(TEXT.SETTINGS.APPOINTMENT_TYPES.LOAD_ERROR)}
        </Typography>
        <Button variant={ButtonVariant.SECONDARY} onClick={() => refetch()} className="mt-2">
          {t(TEXT.GENERAL.BUTTONS.RETRY)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        variant={ButtonVariant.PRIMARY}
        onClick={handleAdd}
        icon={<Plus className="h-4 w-4" aria-hidden />}
        className="w-full sm:w-auto sm:self-end"
      >
        {t(TEXT.SETTINGS.APPOINTMENT_TYPES.ADD)}
      </Button>

      {appointmentTypes.length === 0 ? (
        <Typography variant={TypographyVariant.BODY} className="py-6 text-center text-ink-500">
          {t(TEXT.SETTINGS.APPOINTMENT_TYPES.EMPTY)}
        </Typography>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-ink-200 bg-white [&>li:last-child>button]:border-b-0">
          {appointmentTypes.map((appointmentType) => (
            <AppointmentTypeListRow
              key={appointmentType.uuid}
              appointmentType={appointmentType}
              onEdit={() => handleEdit(appointmentType.uuid)}
            />
          ))}
        </ul>
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
