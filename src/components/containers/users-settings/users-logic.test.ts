import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { UserRole } from '../../../types/auth/auth';
import { ManagedUser, UserStatus } from '../../../types/users/user';
import {
  getInitialRoleSelection,
  getRoleChange,
  getUserActions,
  isLegacyRole,
  sortUsers,
} from './users-logic';

const buildUser = (overrides: Partial<ManagedUser>): ManagedUser => ({
  uuid: 'u',
  email: 'u@example.com',
  fullName: 'Usuario',
  role: UserRole.RECEPTION,
  status: UserStatus.ACTIVE,
  phoneNumber: null,
  attendsPatients: false,
  specialties: [],
  professionalTitle: null,
  licenseNumber: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('sortUsers', () => {
  it('pone a los activos primero y ordena por nombre', () => {
    const users = [
      buildUser({ uuid: '1', fullName: 'Zoila', status: UserStatus.ACTIVE }),
      buildUser({ uuid: '2', fullName: 'Ana', status: UserStatus.INACTIVE }),
      buildUser({ uuid: '3', fullName: 'Bruno', status: UserStatus.ACTIVE }),
    ];
    assert.deepEqual(
      sortUsers(users).map((user) => user.uuid),
      ['3', '1', '2'],
    );
  });

  it('no modifica el arreglo original', () => {
    const users = [buildUser({ uuid: '1', status: UserStatus.INACTIVE }), buildUser({ uuid: '2' })];
    sortUsers(users);
    assert.equal(users[0].uuid, '1');
  });
});

describe('getUserActions', () => {
  const owner = buildUser({ uuid: 'owner', role: UserRole.OWNER });
  const otherOwner = buildUser({ uuid: 'owner2', role: UserRole.OWNER });
  const doctor = buildUser({ uuid: 'doc', role: UserRole.ADMIN });

  it('el propio OWNER edita sus datos y su contraseña, sin rol ni estado', () => {
    assert.deepEqual(getUserActions(owner, 'owner'), {
      canEdit: true,
      canSetPassword: true,
      canChangeRole: false,
      canToggleStatus: false,
    });
  });

  it('otro OWNER se ve solo de lectura', () => {
    assert.deepEqual(getUserActions(otherOwner, 'owner'), {
      canEdit: false,
      canSetPassword: false,
      canChangeRole: false,
      canToggleStatus: false,
    });
  });

  it('un inactivo que es otro OWNER tampoco se toca', () => {
    const inactiveOwner = buildUser({
      uuid: 'old',
      role: UserRole.OWNER,
      status: UserStatus.INACTIVE,
    });
    assert.equal(getUserActions(inactiveOwner, 'owner').canToggleStatus, false);
  });

  it('otro usuario puede editarse, cambiar de rol y desactivarse', () => {
    assert.deepEqual(getUserActions(doctor, 'owner'), {
      canEdit: true,
      canSetPassword: true,
      canChangeRole: true,
      canToggleStatus: true,
    });
  });

  it('un inactivo se puede reactivar', () => {
    const inactive = buildUser({ uuid: 'in', status: UserStatus.INACTIVE });
    assert.equal(getUserActions(inactive, 'owner').canToggleStatus, true);
  });

  it('un usuario con rol viejo o vacío se administra como cualquier otro', () => {
    const legacy = buildUser({ uuid: 'leg', role: 'MEDICO' });
    const empty = buildUser({ uuid: 'nul', role: null });
    assert.equal(getUserActions(legacy, 'owner').canChangeRole, true);
    assert.equal(getUserActions(empty, 'owner').canEdit, true);
  });
});

describe('roles', () => {
  it('USER, MEDICO y vacío son roles anteriores; los fijos no', () => {
    assert.equal(isLegacyRole('USER'), true);
    assert.equal(isLegacyRole('MEDICO'), true);
    assert.equal(isLegacyRole(null), true);
    assert.equal(isLegacyRole(UserRole.OWNER), false);
    assert.equal(isLegacyRole(UserRole.RECEPTION), false);
  });

  it('solo un rol asignable se preselecciona al editar', () => {
    assert.equal(getInitialRoleSelection(UserRole.ADMIN), UserRole.ADMIN);
    assert.equal(getInitialRoleSelection(UserRole.OWNER), '');
    assert.equal(getInitialRoleSelection('USER'), '');
    assert.equal(getInitialRoleSelection(null), '');
  });

  it('el rol no viaja si no se tocó', () => {
    assert.equal(getRoleChange(UserRole.ADMIN, UserRole.ADMIN), undefined);
    assert.equal(getRoleChange('', 'MEDICO'), undefined);
    assert.equal(getRoleChange('', null), undefined);
  });

  it('el rol viaja si se eligió uno distinto, también desde un rol anterior', () => {
    assert.equal(getRoleChange(UserRole.ADMIN, UserRole.RECEPTION), UserRole.ADMIN);
    assert.equal(getRoleChange(UserRole.RECEPTION, 'USER'), UserRole.RECEPTION);
    assert.equal(getRoleChange(UserRole.RECEPTION, null), UserRole.RECEPTION);
  });

  it('OWNER nunca viaja como rol nuevo', () => {
    assert.equal(getRoleChange(UserRole.OWNER, UserRole.RECEPTION), undefined);
  });
});
