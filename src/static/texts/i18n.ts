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
  ACTIVITY: {
    PAGE_TITLE: 'activity.pageTitle',
    TITLE: 'activity.title',
    COUNT: 'activity.count',
    UNKNOWN_ACTOR: 'activity.unknownActor',
    SUMMARY: {
      TODAY: 'activity.summary.today',
      TODAY_EMPTY: 'activity.summary.todayEmpty',
      CONFIRMED_THIS_MONTH: 'activity.summary.confirmedThisMonth',
      TENTATIVE_THIS_MONTH: 'activity.summary.tentativeThisMonth',
      NEW_PATIENTS_THIS_MONTH: 'activity.summary.newPatientsThisMonth',
      BY_ACTOR: 'activity.summary.byActor',
    },
    FILTERS: {
      SEARCH_PLACEHOLDER: 'activity.filters.searchPlaceholder',
      SEARCH_ARIA: 'activity.filters.searchAria',
      SCOPE_ARIA: 'activity.filters.scopeAria',
      SCOPE_APPOINTMENTS: 'activity.filters.scopeAppointments',
      SCOPE_ALL: 'activity.filters.scopeAll',
      ACTOR_LABEL: 'activity.filters.actorLabel',
      ACTOR_ARIA: 'activity.filters.actorAria',
      ACTION_LABEL: 'activity.filters.actionLabel',
      ACTION_ARIA: 'activity.filters.actionAria',
      MONTH_LABEL: 'activity.filters.monthLabel',
      MONTH_ARIA: 'activity.filters.monthAria',
      ALL: 'activity.filters.all',
      ALL_ACTIONS: 'activity.filters.allActions',
    },
    COLUMNS: {
      TIME: 'activity.columns.time',
      PATIENT: 'activity.columns.patient',
      ACTION: 'activity.columns.action',
      DETAIL: 'activity.columns.detail',
      ACTOR: 'activity.columns.actor',
    },
    GROUP: {
      TODAY: 'activity.group.today',
      YESTERDAY: 'activity.group.yesterday',
    },
    STATES: {
      EMPTY_TITLE: 'activity.states.emptyTitle',
      EMPTY_DESCRIPTION: 'activity.states.emptyDescription',
      NO_RESULTS_TITLE: 'activity.states.noResultsTitle',
      NO_RESULTS_DESCRIPTION: 'activity.states.noResultsDescription',
      ERROR_TITLE: 'activity.states.errorTitle',
    },
    /** Prefijo: la etiqueta de cada acción es `${ACTION_PREFIX}.${PatientActivityAction}`. */
    ACTION_PREFIX: 'activity.actions',
    DETAIL: {
      FILES_UPLOADED: 'activity.detail.filesUploaded',
      MORE: 'activity.detail.more',
      EMPTY_VALUE: 'activity.detail.emptyValue',
      BY_TENTATIVE: 'activity.detail.byTentative',
      /** Prefijo: la etiqueta de cada campo es `${FIELD_PREFIX}.${campo}`. */
      FIELD_PREFIX: 'activity.detail.fields',
    },
  },
} as const;
