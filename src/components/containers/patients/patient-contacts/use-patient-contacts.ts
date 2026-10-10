import { usePatientContactsQuery } from '@/shared/api/querys/patient-contacts-query';
import { isSamePhone } from '@/components/containers/patients/patient-validation';

/**
 * Contactos con el principal (el que coincide con el teléfono del paciente)
 * primero. Un paciente de antes de los contactos tiene el teléfono solo en su
 * ficha: se devuelve aparte para mostrarlo igual.
 */
export function usePatientContacts(patientUuid: string, patientPhone?: string) {
  const { data } = usePatientContactsQuery(patientUuid);
  const contacts = data ?? [];

  const primary = patientPhone
    ? contacts.find((contact) => isSamePhone(contact.phone, patientPhone))
    : undefined;
  const sortedContacts = primary
    ? [primary, ...contacts.filter((contact) => contact !== primary)]
    : contacts;

  return {
    contacts: sortedContacts,
    legacyPhone: patientPhone && !primary && data ? patientPhone : null,
  };
}
