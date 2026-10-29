import React from 'react';
import { Pencil, Phone, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TEXT } from '@/static/texts/i18n';
import { PatientContact } from '@/types/patients/patient-contact';
import { usePatientContacts } from './use-patient-contacts';

const ContactLink: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  phone: string;
}> = ({ icon: Icon, name, phone }) => (
  <a
    href={`tel:${phone.replace(/\s/g, '')}`}
    className="flex min-w-0 items-center gap-1.5 text-sm text-ink-600 hover:text-brand-700"
  >
    <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
    <span className="flex min-w-0 items-baseline gap-1">
      <span className="truncate font-medium text-ink-800">{name}</span>
      <span className="shrink-0 whitespace-nowrap">{phone}</span>
    </span>
  </a>
);

interface PatientContactsContainerProps {
  patientUuid: string;
  /** Teléfono guardado en el paciente: el del contacto principal. */
  patientPhone?: string;
  onEdit: () => void;
}

/**
 * Los contactos se ven siempre en el resumen: muchas veces el que contesta es
 * un familiar. Se editan en un modal o en el formulario del paciente.
 */
export const PatientContactsContainer: React.FC<PatientContactsContainerProps> = ({
  patientUuid,
  patientPhone,
  onEdit,
}) => {
  const { t } = useTranslation();
  const { contacts, legacyPhone } = usePatientContacts(patientUuid, patientPhone);

  return (
    <div className="flex flex-col gap-y-1.5">
      {legacyPhone && (
        <ContactLink
          icon={Phone}
          name={t(TEXT.PATIENTS.DETAIL.PATIENT_CONTACT)}
          phone={legacyPhone}
        />
      )}
      {contacts.map((contact: PatientContact, index) => (
        <ContactLink
          key={contact.uuid}
          icon={index === 0 && !legacyPhone ? Phone : Users}
          name={contact.name}
          phone={contact.phone}
        />
      ))}

      <button
        type="button"
        onClick={onEdit}
        className="flex w-fit items-center gap-1.5 whitespace-nowrap text-sm text-ink-500 hover:text-brand-700 hover:underline"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        {t(TEXT.PATIENTS.DETAIL.EDIT_CONTACTS)}
      </button>
    </div>
  );
};
