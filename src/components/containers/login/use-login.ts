import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useLoginMutation } from '@/shared/api/mutations/auth/login-mutation';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { routesPrivate } from '@/shared/navigation/routes';
import { LoginPayload } from '@/types/auth/auth';
import { TEXT } from '@/static/texts/i18n';

export const loginInitialValues: LoginPayload = { email: '', password: '' };

export function useLogin() {
  const router = useRouter();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wasSessionExpired, setWasSessionExpired] = useState(false);
  const { executeLogin, isPending } = useLoginMutation();

  const loginValidationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string()
          .email(t(TEXT.AUTH.LOGIN.VALIDATION.EMAIL_INVALID))
          .required(t(TEXT.AUTH.LOGIN.VALIDATION.EMAIL_REQUIRED)),
        password: Yup.string().required(t(TEXT.AUTH.LOGIN.VALIDATION.PASSWORD_REQUIRED)),
      }),
    [t],
  );

  // Entrar al login siempre limpia la sesión previa.
  useEffect(() => {
    CookiesManager.clearAll();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.expired === 'true') {
      setWasSessionExpired(true);
      void router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router]);

  const handleSubmit = (values: LoginPayload) => {
    setErrorMessage(null);
    setWasSessionExpired(false);

    executeLogin(values, {
      onSuccess: (data) => {
        CookiesManager.setSession(data.access_token, data.user.name);
        void router.push(routesPrivate.patients.index);
      },
      onError: (error: Error) => {
        setErrorMessage(error.message || t(TEXT.AUTH.LOGIN.GENERIC_ERROR));
      },
    });
  };

  return { handleSubmit, isPending, errorMessage, wasSessionExpired, loginValidationSchema };
}
