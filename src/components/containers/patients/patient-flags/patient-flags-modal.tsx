import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ear } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Switch } from '@/components/common/switch/switch';
import { Tabs } from '@/components/common/tabs/tabs';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import { Patient, PatientFlag } from '@/types/patients/patient';
import { tailwind } from '@/utils/tailwind-utils';
import { LabShipmentDate } from './lab-shipment-date';
import { PatientMaintenanceList } from './patient-maintenance-list';
import { PatientFlagSection, usePatientFlags } from './use-patient-flags';
import { WarrantyDocumentSelect } from './warranty-document-select';

interface PatientFlagsModalProps {
  patient: Patient;
  /** Pestaña con la que se abre; por defecto, Laboratorio. */
  initialSection?: PatientFlagSection;
  onClose: () => void;
}

/** Prender o apagar los indicadores: cada switch guarda al tocarlo, sin botón de guardar. */
export const PatientFlagsModal: React.FC<PatientFlagsModalProps> = ({
  patient,
  initialSection,
  onClose,
}) => {
  const { t } = useTranslation();
  const {
    sections,
    activeSection,
    activeFlags,
    isWarrantySection,
    isMaintenanceSection,
    labShipment,
    handleToggle,
    handleSectionChange,
  } = usePatientFlags(patient, initialSection);
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.PATIENTS.FLAGS.TITLE)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4"
      onClick={onClose}
    >
      <div
        className={tailwind(
          'flex max-h-full w-full flex-col rounded-card bg-white',
          isMaintenanceSection ? 'max-w-md sm:max-w-4xl' : 'max-w-md',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start gap-3 px-6 pb-4 pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <Ear className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.PATIENTS.FLAGS.TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.BODY} className="mt-1">
              {t(TEXT.PATIENTS.FLAGS.DESCRIPTION)}
            </Typography>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-2">
          <Tabs
            items={sections.map((section) => ({
              value: section.key,
              label: section.title,
            }))}
            value={activeSection}
            onChange={handleSectionChange}
            ariaLabel={t(TEXT.PATIENTS.FLAGS.TITLE)}
            className="mt-1"
          />
          {isMaintenanceSection ? (
            <>
              <Typography variant={TypographyVariant.BODY} className="mt-3 text-ink-500">
                {t(TEXT.PATIENTS.FLAGS.MAINTENANCE.HINT)}
              </Typography>
              <div className="mt-3">
                <PatientMaintenanceList patient={patient} />
              </div>
            </>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-ink-100 rounded-lg border border-ink-200 px-3">
              {activeFlags.map((item) => {
                const isLab = item.flag === PatientFlag.HEARING_AIDS_IN_LAB;
                return (
                  <div key={item.flag}>
                    <Switch
                      isChecked={item.isOn}
                      onChange={(isOn) => handleToggle(item.flag, isOn)}
                      label={item.label}
                      description={item.description}
                      isLoading={item.isUpdating && !labShipment.isEditing}
                      className="w-full py-2"
                    />
                    {isLab && labShipment.isEditing && (
                      <LabShipmentDate
                        date={labShipment.date}
                        maxDate={labShipment.maxDate}
                        isSaving={labShipment.isSaving}
                        isSaveDisabled={labShipment.isSaveDisabled}
                        onDateChange={labShipment.handleDateChange}
                        onSave={labShipment.handleSave}
                        onCancel={labShipment.handleCancel}
                      />
                    )}
                    {isLab && labShipment.isLabOn && !labShipment.isEditing && (
                      <Button
                        variant={ButtonVariant.GHOST}
                        onClick={labShipment.handleStartDateChange}
                        className="mb-2 min-h-[36px] px-2 py-1 text-brand-700"
                      >
                        {t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.CHANGE_DATE)}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {isWarrantySection && (
            <div className="mt-4">
              <WarrantyDocumentSelect patient={patient} />
            </div>
          )}
        </div>

        {/* Mientras se edita la fecha, "Listo" se leería como guardarla y la descartaría. */}
        {!labShipment.isEditing && (
          <div className="flex shrink-0 justify-end px-6 pb-6 pt-3">
            <Button
              variant={ButtonVariant.SECONDARY}
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              {t(TEXT.PATIENTS.FLAGS.DONE)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
