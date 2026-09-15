import React from 'react';
import { Formik, Form } from 'formik';
import { AlertCircle, Clock } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useLogin, loginValidationSchema, loginInitialValues } from './use-login';

export const LoginContainer: React.FC = () => {
  const { handleSubmit, isPending, errorMessage, wasSessionExpired } = useLogin();

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center">
        <BrandLogo className="text-2xl" />
        <Typography variant={TypographyVariant.CAPTION} className="mt-1 tracking-widest uppercase">
          Expedientes
        </Typography>
      </div>

      <div className="mt-10">
        <Typography variant={TypographyVariant.PAGE_TITLE}>Iniciar sesion</Typography>
        <Typography variant={TypographyVariant.BODY} className="mt-1">
          Ingresa con la cuenta que te asigno la clinica.
        </Typography>
      </div>

      {wasSessionExpired && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <Typography variant={TypographyVariant.BODY} className="text-navy-700">
            Tu sesion expiro por seguridad. Vuelve a ingresar.
          </Typography>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.BODY} className="text-navy-700">
            {errorMessage}
          </Typography>
        </div>
      )}

      <Formik
        initialValues={loginInitialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty }) => (
          <Form className="mt-6 flex flex-col gap-4">
            <FormField
              name="email"
              label="Correo electronico"
              type="email"
              placeholder="nombre@audiocolors.com"
              required
            />
            <FormField
              name="password"
              label="Contrasena"
              type="password"
              placeholder="Tu contrasena"
              required
            />

            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              isLoading={isPending}
              disabled={!isValid || !dirty}
              className="mt-2 w-full"
            >
              {isPending ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </Form>
        )}
      </Formik>

      <Typography variant={TypographyVariant.CAPTION} className="mt-8 block text-center">
        Si no tienes acceso, solicitalo al administrador de la clinica.
      </Typography>
    </div>
  );
};
