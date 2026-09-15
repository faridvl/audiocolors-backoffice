import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import { useLoginMutation } from '@/shared/api/mutations/auth/login-mutation';
import { CookiesManager } from '@/shared/utils/cookies-manager';
import { routesPrivate } from '@/shared/navigation/routes';
import { LoginPayload } from '@/types/auth/auth';

export const loginValidationSchema = Yup.object({
  email: Yup.string().email('Correo invalido').required('El correo es obligatorio'),
  password: Yup.string().required('La contrasena es obligatoria'),
});

export const loginInitialValues: LoginPayload = { email: '', password: '' };

export function useLogin() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wasSessionExpired, setWasSessionExpired] = useState(false);
  const { executeLogin, isPending } = useLoginMutation();

  // Entrar al login siempre limpia la sesion previa.
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
        setErrorMessage(error.message || 'No se pudo iniciar sesion.');
      },
    });
  };

  return { handleSubmit, isPending, errorMessage, wasSessionExpired };
}
