import React from 'react';
import { Pencil, Phone, Users } from 'lucide-react';
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
    <span className="truncate">
      <span className="font-medium text-ink-800">{name}</span> {phone}
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
 * un familiar. Se editan en el formulario del paciente, porque el primero es
 * el teléfono principal y se guarda junto con el paciente.
 */
export const PatientContactsContainer: React.FC<PatientContactsContainerProps> = ({
  patientUuid,
  patientPhone,
  onEdit,
}) => {
  const { contacts, legacyPhone } = usePatientContacts(patientUuid, patientPhone);

  return (
    <div className="flex flex-col gap-y-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
      {legacyPhone && <ContactLink icon={Phone} name="Paciente" phone={legacyPhone} />}
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
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Editar contactos
      </button>
    </div>
  );
};
