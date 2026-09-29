import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, UserRound, X } from 'lucide-react';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { inputBaseClasses } from '@/components/common/input/input';
import { formatMonthLabel, getFullName } from '@/shared/utils/formatters';
import { tailwind } from '@/utils/tailwind-utils';
import { TEXT } from '@/static/texts/i18n';
import { Patient } from '@/types/patients/patient';
import { usePatientPicker } from './use-patient-picker';

interface PatientPickerModalProps {
  onPick: (patient: Patient) => void;
  onClose: () => void;
}

/**
 * Primer paso de "Agendar" desde la agenda: elegir al paciente. Lo que sigue
 * es el mismo modal de próxima cita del expediente, para que haya una sola
 * forma de agendar.
 */
export const PatientPickerModal: React.FC<PatientPickerModalProps> = ({ onPick, onClose }) => {
  const { t } = useTranslation();
  const { searchTerm, setSearchTerm, hasEnoughText, isSearching, patients } = usePatientPicker();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.AGENDA.PICKER.TITLE)}
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/70 p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-card bg-white p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <Typography variant={TypographyVariant.ACCENT}>
              {t(TEXT.AGENDA.PICKER.TITLE)}
            </Typography>
            <Typography variant={TypographyVariant.HELPER}>
              {t(TEXT.AGENDA.PICKER.DESCRIPTION)}
            </Typography>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(TEXT.AGENDA.PICKER.CLOSE)}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            aria-hidden
          />
          <input
            type="search"
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t(TEXT.AGENDA.PICKER.SEARCH_PLACEHOLDER)}
            aria-label={t(TEXT.AGENDA.PICKER.SEARCH_ARIA)}
            className={tailwind(inputBaseClasses, 'pl-9 pr-9')}
          />
          {isSearching && hasEnoughText && (
            <Loader2
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-400"
              aria-hidden
            />
          )}
        </div>

        <div className="mt-3 flex flex-col gap-1">
          {!hasEnoughText && (
            <Typography variant={TypographyVariant.HELPER} className="px-1 py-2">
              {t(TEXT.AGENDA.PICKER.HINT)}
            </Typography>
          )}

          {hasEnoughText && !isSearching && patients.length === 0 && (
            <Typography variant={TypographyVariant.HELPER} className="px-1 py-2">
              {t(TEXT.AGENDA.PICKER.EMPTY)}
            </Typography>
          )}

          {patients.map((patient) => (
            <button
              key={patient.uuid}
              type="button"
              onClick={() => onPick(patient)}
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-ink-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100">
                <UserRound className="h-4 w-4 text-ink-500" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-col">
                <Typography variant={TypographyVariant.BODY_SEMIBOLD} className="truncate">
                  {getFullName(patient.firstName, patient.lastName)}
                </Typography>
                <Typography variant={TypographyVariant.HELPER} className="truncate">
                  {[
                    patient.documentId,
                    patient.tentativeAppointmentMonth
                      ? formatMonthLabel(patient.tentativeAppointmentMonth)
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </Typography>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
