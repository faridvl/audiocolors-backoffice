import * as Yup from 'yup';
import type { TFunction } from 'i18next';
import { PhoneError, validatePhone } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import { UserRole } from '@/types/auth/auth';
import {
  ManagedUser,
  USER_EMAIL_MAX_LENGTH,
  USER_FULL_NAME_MAX_LENGTH,
  USER_PASSWORD_DIGIT_PATTERN,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_PASSWORD_UPPERCASE_PATTERN,
  USER_SPECIALTY_MAX_LENGTH,
} from '@/types/users/user';

const ERRORS = TEXT.SETTINGS.USERS.ERRORS;

export interface UserFormValues {
  fullName: string;
  email: string;
  role: UserRole;
  specialty: string;
  phone: string;
  password: string;
}

export interface UserPasswordFormValues {
  password: string;
}

export const USER_FORM_FIELDS = ['fullName', 'email', 'role', 'specialty', 'phone', 'password'];

/** El API nombra el teléfono `phoneNumber`; el formulario lo llama `phone`. */
export const API_FIELD_TO_FORM_FIELD: Record<string, string> = {
  phoneNumber: 'phone',
};

const PHONE_ERROR_KEYS: Record<PhoneError, string> = {
  [PhoneError.LOCAL_FORMAT]: ERRORS.PHONE_LOCAL,
  [PhoneError.INTERNATIONAL_FORMAT]: ERRORS.PHONE_INTERNATIONAL,
};

export function buildUserFormInitialValues(user: ManagedUser | null): UserFormValues {
  return {
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    role: user?.role ?? UserRole.STAFF,
    specialty: user?.specialty ?? '',
    phone: user?.phoneNumber ?? '',
    password: '',
  };
}

export const buildPasswordSchema = (t: TFunction) =>
  Yup.string()
    .required(t(ERRORS.PASSWORD_REQUIRED))
    .min(USER_PASSWORD_MIN_LENGTH, t(ERRORS.PASSWORD_MIN))
    .max(USER_PASSWORD_MAX_LENGTH, t(ERRORS.PASSWORD_MAX))
    .matches(USER_PASSWORD_UPPERCASE_PATTERN, t(ERRORS.PASSWORD_UPPERCASE))
    .matches(USER_PASSWORD_DIGIT_PATTERN, t(ERRORS.PASSWORD_DIGIT));

export const buildUserPasswordSchema = (t: TFunction) =>
  Yup.object({ password: buildPasswordSchema(t) });

/** En una edición el correo y la contraseña no se tocan, así que no se validan. */
export const buildUserSchema = (t: TFunction, isNew: boolean) =>
  Yup.object({
    fullName: Yup.string()
      .trim()
      .required(t(ERRORS.FULL_NAME_REQUIRED))
      .max(USER_FULL_NAME_MAX_LENGTH, t(ERRORS.FULL_NAME_MAX)),
    email: isNew
      ? Yup.string()
          .trim()
          .required(t(ERRORS.EMAIL_REQUIRED))
          .max(USER_EMAIL_MAX_LENGTH, t(ERRORS.EMAIL_INVALID))
          .email(t(ERRORS.EMAIL_INVALID))
      : Yup.string(),
    role: Yup.mixed<UserRole>().oneOf(Object.values(UserRole)).required(),
    specialty: Yup.string().max(USER_SPECIALTY_MAX_LENGTH, t(ERRORS.SPECIALTY_MAX)),
    phone: Yup.string().test('valid-phone', (value, context) => {
      const error = validatePhone(value ?? '');
      return error === null ? true : context.createError({ message: t(PHONE_ERROR_KEYS[error]) });
    }),
    password: isNew ? buildPasswordSchema(t) : Yup.string(),
  });
