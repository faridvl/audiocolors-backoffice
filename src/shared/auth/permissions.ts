import { ClinicalSpecialty, UserRole } from '../../types/auth/auth';

/** Lo que el usuario puede ver o hacer en pantalla. El API valida lo mismo: ocultar no protege. */
export enum Permission {
  /** Historia clínica, evolución, preguntas, notas y mantenimientos: solo si atiende pacientes. */
  VIEW_CLINICAL_RECORD = 'VIEW_CLINICAL_RECORD',
  /** Sección Archivos del paciente (listar y subir): solo quien atiende pacientes. */
  VIEW_PATIENT_FILES = 'VIEW_PATIENT_FILES',
  /** Crear o invalidar pruebas: atiende pacientes y tiene Audiología. Verlas no lo exige. */
  EDIT_AUDIOLOGY_TESTS = 'EDIT_AUDIOLOGY_TESTS',
  VIEW_ACTIVITY = 'VIEW_ACTIVITY',
  EDIT_CLINICAL_TEMPLATE = 'EDIT_CLINICAL_TEMPLATE',
  EDIT_APPOINTMENT_TYPES = 'EDIT_APPOINTMENT_TYPES',
  VIEW_CLINIC = 'VIEW_CLINIC',
  EDIT_CLINIC = 'EDIT_CLINIC',
  /** Crear, desactivar y poner contraseña a los usuarios (con límites). */
  MANAGE_USERS = 'MANAGE_USERS',
  /** Modificar un paciente y cambiar su estado: Administración, Propietario o quien atiende pacientes. */
  EDIT_PATIENT = 'EDIT_PATIENT',
  /** Eliminar un paciente: Administración o Propietario, igual que en el API. */
  DELETE_PATIENT = 'DELETE_PATIENT',
  /** Atiende pacientes, especialidades y nivel Propietario: solo el Propietario. */
  MANAGE_CLINICAL_ACCESS = 'MANAGE_CLINICAL_ACCESS',
}

export interface PermissionSubject {
  role: UserRole;
  attendsPatients: boolean;
  specialties: ClinicalSpecialty[];
}

const MANAGEMENT_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.OWNER];

/**
 * Los permisos salen del nivel y de "Atiende pacientes", no de una tabla por rol: ningún nivel,
 * ni el Propietario, ve datos clínicos sin atender pacientes (D71).
 */
export function hasPermission(
  subject: PermissionSubject | null | undefined,
  permission: Permission,
): boolean {
  if (!subject) return false;
  const isManagement = MANAGEMENT_ROLES.includes(subject.role);

  switch (permission) {
    case Permission.VIEW_CLINICAL_RECORD:
    case Permission.VIEW_PATIENT_FILES:
      return subject.attendsPatients;
    case Permission.EDIT_AUDIOLOGY_TESTS:
      return subject.attendsPatients && subject.specialties.includes(ClinicalSpecialty.AUDIOLOGY);
    case Permission.VIEW_ACTIVITY:
    case Permission.EDIT_CLINICAL_TEMPLATE:
    case Permission.EDIT_APPOINTMENT_TYPES:
    case Permission.VIEW_CLINIC:
    case Permission.EDIT_CLINIC:
    case Permission.MANAGE_USERS:
    case Permission.DELETE_PATIENT:
      return isManagement;
    case Permission.EDIT_PATIENT:
      return isManagement || subject.attendsPatients;
    case Permission.MANAGE_CLINICAL_ACCESS:
      return subject.role === UserRole.OWNER;
    default:
      return false;
  }
}
