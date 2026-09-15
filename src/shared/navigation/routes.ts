export const routesPrivate = {
  patients: {
    index: '/pacientes',
    create: '/pacientes/nuevo',
    detail: (uuid: string) => `/pacientes/${uuid}`,
    edit: (uuid: string) => `/pacientes/${uuid}/editar`,
  },
};

export const routesPublic = {
  login: '/login',
};
