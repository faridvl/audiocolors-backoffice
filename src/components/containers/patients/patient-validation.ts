import * as Yup from 'yup';
import { TEXT } from '@/static/texts/i18n';
import { DocumentType, PatientGender } from '@/types/patients/patient';
import { PatientContact } from '@/types/patients/patient-contact';
import {
  formatPhoneForDisplay,
  isSamePhone,
  normalizePhone,
  PhoneError,
  toPatientPhone,
  validatePhoneUnlessUnchanged,
} from '@/shared/utils/phone';

export const NAME_REGEX = /^[a-zA-ZaeiouAEIOUuUnN\u00C0-\u017F\s]+$/;

export const DOCUMENT_MASKS: Record<DocumentType, { maxLength: number; placeholder: string }> = {
  [DocumentType.NATIONAL]: { maxLength: 11, placeholder: '1-2345-6789' },
  [DocumentType.DIMEX]: { maxLength: 12, placeholder: '123456789012' },
  [DocumentType.PASSPORT]: { maxLength: 20, placeholder: 'AB123456' },
};

/** Formatea una cedula nacional costarricense como X-XXXX-XXXX. */
export function formatNationalId(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 1) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`;
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`;
}

function isPastOrPresentDate(value: string | undefined): boolean {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed <= new Date();
}

const baseFields = {
  firstName: Yup.string()
    .matches(NAME_REGEX, 'Solo letras y espacios')
    .max(60, 'Máximo 60 caracteres')
    .required('El nombre es obligatorio'),
  lastName: Yup.string()
    .matches(NAME_REGEX, 'Solo letras y espacios')
    .max(60, 'Máximo 60 caracteres')
    .required('El apellido es obligatorio'),
  documentId: Yup.string().max(20, 'Máximo 20 caracteres').required('La cédula es obligatoria'),
  email: Yup.string().email('Correo inválido'),
  birthDate: Yup.string()
    .required('La fecha de nacimiento es obligatoria')
    .test('not-future', 'La fecha no puede ser futura', isPastOrPresentDate),
  address: Yup.string().max(240, 'Máximo 240 caracteres'),
  gender: Yup.string().oneOf(Object.values(PatientGender), 'Selecciona una opción'),
  branchUuids: Yup.array().of(Yup.string().required()).min(1, TEXT.PATIENTS.FORM.BRANCHES_REQUIRED),
};

const CONTACT_NAME_MAX_LENGTH = 80;

const PHONE_ERROR_MESSAGES: Record<PhoneError, string> = {
  [PhoneError.LOCAL_FORMAT]: 'Formato: 8888-8888. Si es de otro país, empieza con +.',
  [PhoneError.INTERNATIONAL_FORMAT]:
    'Revisa el número: con + y el código del país, de 8 a 15 dígitos.',
  [PhoneError.COSTA_RICA_WITH_PLUS]: 'Parece un número de Costa Rica: escríbelo sin el +',
};

/** `unchangedPhones`: teléfonos que vienen de la base; si no se tocan, no se validan. */
const buildContactsField = (unchangedPhones: ReadonlySet<string>) =>
  Yup.array()
    .of(
      Yup.object({
        name: Yup.string().max(CONTACT_NAME_MAX_LENGTH, 'Máximo 80 caracteres'),
        phone: Yup.string()
          .test('valid-phone', (value, context) => {
            const error = validatePhoneUnlessUnchanged(value ?? '', unchangedPhones);
            return error === null
              ? true
              : context.createError({ message: PHONE_ERROR_MESSAGES[error] });
          })
          .required('El teléfono es obligatorio'),
      }),
    )
    .min(1, 'Agrega al menos un contacto');

const NO_UNCHANGED_PHONES: ReadonlySet<string> = new Set();

const toUnchangedPhones = (contacts: PatientContactFormValues[]): ReadonlySet<string> =>
  new Set(contacts.map((contact) => contact.phone).filter(Boolean));

export const patientCreateValidationSchema = Yup.object({
  ...baseFields,
  contacts: buildContactsField(NO_UNCHANGED_PHONES),
});

export const buildPatientEditValidationSchema = (initialContacts: PatientContactFormValues[]) =>
  Yup.object({
    ...baseFields,
    // Al editar es opcional: obligarla empujaría a inventar fechas en un expediente clínico.
    birthDate: Yup.string().test(
      'not-future',
      'La fecha no puede ser futura',
      (value) => !value || isPastOrPresentDate(value),
    ),
    contacts: buildContactsField(toUnchangedPhones(initialContacts)),
  });

/** Solo los contactos, para editarlos desde el expediente sin abrir el formulario entero. */
export const buildPatientContactsValidationSchema = (initialContacts: PatientContactFormValues[]) =>
  Yup.object({
    contacts: buildContactsField(toUnchangedPhones(initialContacts)),
  });

export interface PatientContactFormValues {
  /** Presente solo si el contacto ya existía al abrir el formulario. */
  uuid?: string;
  name: string;
  phone: string;
}

export interface PatientFormValues {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentId: string;
  birthDate: string;
  gender: string;
  email: string;
  address: string;
  branchUuids: string[];
  contacts: PatientContactFormValues[];
}

/**
 * El paciente no tiene un campo de teléfono aparte: el primer contacto es el
 * principal y su número se guarda también en el paciente, que es el que usan
 * WhatsApp, "Llamar" y la búsqueda. Un contacto sin nombre es el paciente.
 */
export function resolveContactsForSave(
  contacts: PatientContactFormValues[],
  patientFullName: string,
): { phone: string | undefined; contacts: PatientContactFormValues[] } {
  const filled = contacts
    .filter((contact) => contact.phone.trim())
    .map((contact) => ({
      ...(contact.uuid && { uuid: contact.uuid }),
      name: (contact.name.trim() || patientFullName).slice(0, CONTACT_NAME_MAX_LENGTH),
      phone: normalizePhone(contact.phone),
    }));
  const primaryPhone = filled[0]?.phone;

  return {
    phone: primaryPhone ? toPatientPhone(primaryPhone) : undefined,
    contacts: filled,
  };
}

/**
 * El contacto con el teléfono del paciente va primero, porque el primero es el
 * principal. Si ninguno lo tiene (pacientes de antes de los contactos), ese
 * teléfono entra como primer contacto con el nombre del paciente.
 */
export function buildInitialContacts(
  contacts: PatientContact[],
  patientPhone: string | undefined,
  patientFullName: string,
): PatientContactFormValues[] {
  const formContacts = contacts.map(({ uuid, name, phone }) => ({
    uuid,
    name,
    phone: formatPhoneForDisplay(phone),
  }));
  if (!patientPhone) {
    return formContacts.length > 0 ? formContacts : [{ name: '', phone: '' }];
  }

  const primary = formContacts.find((contact) => isSamePhone(contact.phone, patientPhone));
  if (!primary) {
    return [{ name: patientFullName, phone: formatPhoneForDisplay(patientPhone) }, ...formContacts];
  }
  return [primary, ...formContacts.filter((contact) => contact !== primary)];
}
