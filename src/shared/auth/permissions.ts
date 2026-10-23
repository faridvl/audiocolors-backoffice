import { UserRole } from '@/types/auth/auth';

/** Lo que cada rol puede ver o hacer en pantalla. El API valida lo mismo: ocultar no protege. */
export enum Permission {
  /** Historia clínica y Control de evolución del expediente. */
  VIEW_CLINICAL_RECORD = 'VIEW_CLINICAL_RECORD',
  VIEW_ACTIVITY = 'VIEW_ACTIVITY',
  EDIT_CLINICAL_TEMPLATE = 'EDIT_CLINICAL_TEMPLATE',
}

const CLINICAL_PERMISSIONS = Object.values(Permission);

/**
 * STAFF es el empleado (recepción, secretaría): ve pacientes, contactos, citas y
 * archivos, pero nada clínico. El médico puede ser además el dueño.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: CLINICAL_PERMISSIONS,
  [UserRole.ADMIN]: CLINICAL_PERMISSIONS,
  [UserRole.DOCTOR]: CLINICAL_PERMISSIONS,
  [UserRole.STAFF]: [],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  return role ? (ROLE_PERMISSIONS[role]?.includes(permission) ?? false) : false;
}
