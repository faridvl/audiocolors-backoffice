import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { AppointmentTypeListRow } from './appointment-type-list-row';
import { EditAppointmentTypeModal } from './edit-appointment-type-modal';
import { useAppointmentTypesSettings } from './use-appointment-types-settings';

export const AppointmentTypesSettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const {
    appointmentTypes,
    currentControl,
    editingType,
    isLoading,
    isError,
    refetch,
    isSaving,
    handleEdit,
    handleCloseEdit,
    handleSave,
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
    <div className="flex max-w-2xl flex-col gap-4">
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

      {editingType && (
        <EditAppointmentTypeModal
          key={editingType.uuid}
          appointmentType={editingType}
          currentControl={currentControl}
          isSaving={isSaving}
          onSave={handleSave}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};
