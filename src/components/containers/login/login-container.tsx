import React from 'react';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { FormField } from '@/components/common/input/input';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { useLogin, loginInitialValues } from './use-login';

export const LoginContainer: React.FC = () => {
  const { t } = useTranslation();
  const { handleSubmit, isPending, errorMessage, wasSessionExpired, loginValidationSchema } =
    useLogin();

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center md:hidden">
        <BrandLogo height={48} priority />
        <Typography
          variant={TypographyVariant.HELPER}
          className="mt-2 uppercase tracking-[0.2em] text-ink-400"
        >
          {t(TEXT.AUTH.LOGIN.TAGLINE)}
        </Typography>
      </div>

      <div className="mt-10 md:mt-0">
        <Typography variant={TypographyVariant.HEADER}>{t(TEXT.AUTH.LOGIN.TITLE)}</Typography>
        <Typography variant={TypographyVariant.BODY} className="mt-1">
          {t(TEXT.AUTH.LOGIN.SUBTITLE)}
        </Typography>
      </div>

      {wasSessionExpired && (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
          <Typography variant={TypographyVariant.BODY} className="text-ink-700">
            {t(TEXT.AUTH.LOGIN.SESSION_EXPIRED)}
          </Typography>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.BODY} className="text-ink-700">
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
              label={t(TEXT.AUTH.LOGIN.FORM.EMAIL_LABEL)}
              type="email"
              placeholder={t(TEXT.AUTH.LOGIN.FORM.EMAIL_PLACEHOLDER)}
              required
            />
            <FormField
              name="password"
              label={t(TEXT.AUTH.LOGIN.FORM.PASSWORD_LABEL)}
              type="password"
              placeholder={t(TEXT.AUTH.LOGIN.FORM.PASSWORD_PLACEHOLDER)}
              required
            />

            <Button
              type="submit"
              variant={ButtonVariant.PRIMARY}
              isLoading={isPending}
              disabled={!isValid || !dirty}
              className="mt-2 w-full"
            >
              {isPending ? t(TEXT.AUTH.LOGIN.FORM.SUBMITTING) : t(TEXT.AUTH.LOGIN.FORM.SUBMIT)}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
