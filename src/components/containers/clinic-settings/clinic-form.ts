import * as Yup from 'yup';
import type { TFunction } from 'i18next';
import { PhoneError, validatePhone } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import {
  Tenant,
  TENANT_ADDRESS_MAX_LENGTH,
  TENANT_EMAIL_MAX_LENGTH,
  TENANT_NAME_MAX_LENGTH,
} from '@/types/tenant/tenant';

const ERRORS = TEXT.SETTINGS.CLINIC.ERRORS;

export interface ClinicFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const PHONE_ERROR_KEYS: Record<PhoneError, string> = {
  [PhoneError.LOCAL_FORMAT]: ERRORS.PHONE_LOCAL,
  [PhoneError.INTERNATIONAL_FORMAT]: ERRORS.PHONE_INTERNATIONAL,
};

export const isClinicFormField = (field: string): field is keyof ClinicFormValues =>
  field === 'name' || field === 'phone' || field === 'email' || field === 'address';

export function buildClinicFormInitialValues(tenant: Tenant): ClinicFormValues {
  return {
    name: tenant.businessName,
    phone: tenant.phone ?? '',
    email: tenant.email ?? '',
    address: tenant.address ?? '',
  };
}

export const buildClinicFormSchema = (t: TFunction) =>
  Yup.object({
    name: Yup.string()
      .trim()
      .required(t(ERRORS.NAME_REQUIRED))
      .max(TENANT_NAME_MAX_LENGTH, t(ERRORS.NAME_MAX)),
    phone: Yup.string().test('valid-phone', (value, context) => {
      const error = validatePhone(value ?? '');
      return error === null ? true : context.createError({ message: t(PHONE_ERROR_KEYS[error]) });
    }),
    email: Yup.string()
      .trim()
      .max(TENANT_EMAIL_MAX_LENGTH, t(ERRORS.EMAIL_INVALID))
      .email(t(ERRORS.EMAIL_INVALID)),
    address: Yup.string().max(TENANT_ADDRESS_MAX_LENGTH, t(ERRORS.ADDRESS_MAX)),
  });
