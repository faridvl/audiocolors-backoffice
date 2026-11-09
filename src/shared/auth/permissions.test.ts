import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalSpecialty, UserRole } from '../../types/auth/auth';
import { hasPermission, Permission, PermissionSubject } from './permissions';

const subject = (
  role: UserRole,
  attendsPatients: boolean,
  specialties: ClinicalSpecialty[] = attendsPatients ? [ClinicalSpecialty.AUDIOLOGY] : [],
): PermissionSubject => ({ role, attendsPatients, specialties });

const MANAGEMENT_PERMISSIONS = [
  Permission.VIEW_ACTIVITY,
  Permission.EDIT_CLINICAL_TEMPLATE,
  Permission.EDIT_APPOINTMENT_TYPES,
  Permission.VIEW_CLINIC,
  Permission.EDIT_CLINIC,
  Permission.MANAGE_USERS,
  Permission.DELETE_PATIENT,
];

const ROLES = [UserRole.RECEPTION, UserRole.ADMIN, UserRole.OWNER];

describe('hasPermission', () => {
  it('sin sesion no hay ningun permiso', () => {
    for (const permission of Object.values(Permission)) {
      assert.equal(hasPermission(null, permission), false);
      assert.equal(hasPermission(undefined, permission), false);
    }
  });

  for (const role of ROLES) {
    for (const attendsPatients of [true, false]) {
      const label = `${role} ${attendsPatients ? 'atiende' : 'no atiende'}`;
      const current = subject(role, attendsPatients);

      it(`${label}: lo clinico y los archivos dependen solo de atender`, () => {
        assert.equal(hasPermission(current, Permission.VIEW_CLINICAL_RECORD), attendsPatients);
        assert.equal(hasPermission(current, Permission.VIEW_PATIENT_FILES), attendsPatients);
      });

      it(`${label}: editar pruebas exige atender con Audiologia`, () => {
        assert.equal(hasPermission(current, Permission.EDIT_AUDIOLOGY_TESTS), attendsPatients);
      });

      it(`${label}: configuracion y bitacora solo para Administracion y Propietario`, () => {
        const isManagement = role !== UserRole.RECEPTION;
        for (const permission of MANAGEMENT_PERMISSIONS) {
          assert.equal(hasPermission(current, permission), isManagement, permission);
        }
      });

      it(`${label}: el acceso clinico lo gestiona solo el Propietario`, () => {
        assert.equal(
          hasPermission(current, Permission.MANAGE_CLINICAL_ACCESS),
          role === UserRole.OWNER,
        );
      });
    }
  }

  it('atiende con Otorrinolaringologia sin Audiologia ve lo clinico pero no edita pruebas', () => {
    const current = subject(UserRole.ADMIN, true, [ClinicalSpecialty.ENT]);
    assert.equal(hasPermission(current, Permission.VIEW_CLINICAL_RECORD), true);
    assert.equal(hasPermission(current, Permission.VIEW_PATIENT_FILES), true);
    assert.equal(hasPermission(current, Permission.EDIT_AUDIOLOGY_TESTS), false);
  });

  it('con Audiologia pero sin atender pacientes no edita pruebas', () => {
    const current = subject(UserRole.OWNER, false, [ClinicalSpecialty.AUDIOLOGY]);
    assert.equal(hasPermission(current, Permission.EDIT_AUDIOLOGY_TESTS), false);
  });
});
