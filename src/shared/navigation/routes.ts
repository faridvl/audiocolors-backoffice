export const routesPrivate = {
  patients: {
    index: '/pacientes',
    create: '/pacientes/nuevo',
    detail: (uuid: string) => `/pacientes/${uuid}`,
    edit: (uuid: string) => `/pacientes/${uuid}/editar`,
  },
  agenda: {
    index: '/agenda',
  },
  activity: {
    index: '/bitacora',
  },
};

export const routesPublic = {
  login: '/login',
};
