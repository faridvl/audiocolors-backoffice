import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { UserRole } from '../../../types/auth/auth';
import { ManagedUser, UserStatus } from '../../../types/users/user';
import { getUserActions, sortUsers } from './users-logic';

const buildUser = (overrides: Partial<ManagedUser>): ManagedUser => ({
  uuid: 'u',
  email: 'u@example.com',
  fullName: 'Usuario',
  role: UserRole.STAFF,
  status: UserStatus.ACTIVE,
  specialty: null,
  phoneNumber: null,
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
  const secondOwner = buildUser({ uuid: 'owner2', role: UserRole.OWNER });
  const doctor = buildUser({ uuid: 'doc', role: UserRole.DOCTOR });

  it('uno mismo no cambia su rol ni se desactiva', () => {
    const actions = getUserActions(owner, [owner, secondOwner, doctor], 'owner');
    assert.equal(actions.canChangeRole, false);
    assert.equal(actions.canToggleStatus, false);
  });

  it('otro usuario sí puede cambiar de rol y desactivarse', () => {
    const actions = getUserActions(doctor, [owner, doctor], 'owner');
    assert.equal(actions.canChangeRole, true);
    assert.equal(actions.canToggleStatus, true);
  });

  it('el único OWNER activo no se toca', () => {
    const inactiveOwner = buildUser({
      uuid: 'old',
      role: UserRole.OWNER,
      status: UserStatus.INACTIVE,
    });
    const actions = getUserActions(owner, [owner, inactiveOwner, doctor], 'someone-else');
    assert.equal(actions.canChangeRole, false);
    assert.equal(actions.canToggleStatus, false);
  });

  it('con dos OWNER activos, otro OWNER sí se puede tocar', () => {
    const actions = getUserActions(secondOwner, [owner, secondOwner], 'owner');
    assert.equal(actions.canToggleStatus, true);
  });

  it('un inactivo se puede reactivar', () => {
    const inactive = buildUser({ uuid: 'in', status: UserStatus.INACTIVE });
    assert.equal(getUserActions(inactive, [owner, inactive], 'owner').canToggleStatus, true);
  });
});
