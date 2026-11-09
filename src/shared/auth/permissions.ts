import { UserRole } from '@/types/auth/auth';

/** Lo que cada rol puede ver o hacer en pantalla. El API valida lo mismo: ocultar no protege. */
export enum Permission {
  /** Historia clínica y Control de evolución del expediente. */
  VIEW_CLINICAL_RECORD = 'VIEW_CLINICAL_RECORD',
  VIEW_ACTIVITY = 'VIEW_ACTIVITY',
  EDIT_CLINICAL_TEMPLATE = 'EDIT_CLINICAL_TEMPLATE',
  EDIT_APPOINTMENT_TYPES = 'EDIT_APPOINTMENT_TYPES',
  /** Ver los datos de contacto de la clínica en Configuración. */
  VIEW_CLINIC = 'VIEW_CLINIC',
  /** Cambiarlos: el API solo lo permite al dueño y a administración. */
  EDIT_CLINIC = 'EDIT_CLINIC',
  /** Administrar los usuarios de la clínica: solo el dueño. */
  MANAGE_USERS = 'MANAGE_USERS',
}

const ALL_PERMISSIONS = Object.values(Permission);
const OWNER_ONLY_PERMISSIONS: Permission[] = [Permission.MANAGE_USERS];
const withoutOwnerOnly = (permissions: Permission[]) =>
  permissions.filter((permission) => !OWNER_ONLY_PERMISSIONS.includes(permission));

/**
 * STAFF es el empleado (recepción, secretaría): ve pacientes, contactos, citas y
 * archivos, pero nada clínico. El médico puede ser además el dueño.
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: ALL_PERMISSIONS,
  [UserRole.ADMIN]: withoutOwnerOnly(ALL_PERMISSIONS),
  [UserRole.DOCTOR]: withoutOwnerOnly(ALL_PERMISSIONS).filter(
    (permission) => permission !== Permission.EDIT_CLINIC,
  ),
  [UserRole.STAFF]: [],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  return role ? (ROLE_PERMISSIONS[role]?.includes(permission) ?? false) : false;
}
