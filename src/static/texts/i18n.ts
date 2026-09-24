export const TEXT = {
  GENERAL: {
    BUTTONS: {
      SAVE: 'common.buttons.save',
      CANCEL: 'common.buttons.cancel',
      LOADING: 'common.buttons.loading',
    },
    PAGINATION: {
      SHOWING: 'common.pagination.showing',
    },
  },
  AUTH: {
    LOGIN: {
      PAGE_TITLE: 'auth.login.pageTitle',
      TAGLINE: 'auth.login.tagline',
      TITLE: 'auth.login.title',
      SUBTITLE: 'auth.login.subtitle',
      SESSION_EXPIRED: 'auth.login.sessionExpired',
      GENERIC_ERROR: 'auth.login.genericError',
      FORM: {
        EMAIL_LABEL: 'auth.login.form.emailLabel',
        EMAIL_PLACEHOLDER: 'auth.login.form.emailPlaceholder',
        PASSWORD_LABEL: 'auth.login.form.passwordLabel',
        PASSWORD_PLACEHOLDER: 'auth.login.form.passwordPlaceholder',
        SUBMIT: 'auth.login.form.submit',
        SUBMITTING: 'auth.login.form.submitting',
      },
      VALIDATION: {
        EMAIL_INVALID: 'auth.login.validation.emailInvalid',
        EMAIL_REQUIRED: 'auth.login.validation.emailRequired',
        PASSWORD_REQUIRED: 'auth.login.validation.passwordRequired',
      },
    },
  },
} as const;
