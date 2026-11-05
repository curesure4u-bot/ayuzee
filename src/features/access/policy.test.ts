import { describe, expect, it } from 'vitest';
import { accountRoles, grantedAccountRoles, hospitalRoles } from './roles';
import { features, hospitalRoleModules, mayEnterWorkspace, mayReadHospitalModule, mayReadResource, mayViewFeature, roleFeatures, type HospitalGrant } from './policy';

describe('account workspace and feature policy', () => {
  it.each(accountRoles)('maps %s explicitly without inheriting another workspace', role => {
    const identity = { userId: 'a', roles: [role], ready: true };
    expect(mayEnterWorkspace(identity, role)).toBe(true);
    for (const other of accountRoles.filter(value => value !== role)) expect(mayEnterWorkspace(identity, other)).toBe(false);
    for (const feature of Object.keys(features)) {
      expect(mayViewFeature(identity, role, feature)).toBe(roleFeatures[role].some(id => id === feature));
    }
  });
  it('uses the active workspace rather than merging the capabilities of all grants', () => {
    const identity = { userId: 'a', roles: ['patient', 'doctor'], ready: true };
    expect(mayViewFeature(identity, 'patient', 'doctor.cases')).toBe(false);
    expect(mayViewFeature(identity, 'doctor', 'patient.records')).toBe(false);
    expect(mayViewFeature(identity, 'doctor', 'doctor.cases')).toBe(true);
  });
  it('does not promote unknown roles, pending role requests, or hospital role names', () => {
    expect(grantedAccountRoles(['owner', 'pharmacist', 'new-admin', 'patient', 'patient'])).toEqual(['patient']);
    const identity = { userId: 'a', roles: ['patient'], ready: true, requestedRole: 'doctor' };
    for (const role of ['doctor', 'constructor', '__proto__', '', 'owner']) expect(mayEnterWorkspace(identity, role)).toBe(false);
    for (const feature of ['constructor', '__proto__', 'admin.access', 'doctor.cases', '']) expect(mayViewFeature(identity, 'patient', feature)).toBe(false);
  });
  it('fails closed while access is loading, missing, or revoked', () => {
    for (const identity of [null, { userId: 'a', roles: ['doctor'], ready: false }, { userId: '', roles: ['doctor'], ready: true }, { userId: 'a', roles: [], ready: true }]) {
      expect(mayEnterWorkspace(identity, 'doctor')).toBe(false);
    }
  });
  it('requires ownership or actual assignment; platform titles do not grant records', () => {
    const patient = { userId: 'a', roles: ['patient'], ready: true };
    expect(mayReadResource(patient, 'patient', 'patient.records', { ownerUserId: 'a' })).toBe(true);
    expect(mayReadResource(patient, 'patient', 'patient.records', { ownerUserId: 'b' })).toBe(false);
    const doctor = { userId: 'a', roles: ['doctor'], ready: true };
    expect(mayReadResource(doctor, 'doctor', 'doctor.cases', { assignedUserIds: ['b'] })).toBe(false);
    expect(mayReadResource(doctor, 'doctor', 'doctor.cases', { assignedUserIds: ['a'] })).toBe(true);
    const admin = { userId: 'a', roles: ['super_admin'], ready: true };
    expect(mayReadResource(admin, 'super_admin', 'doctor.cases', { assignedUserIds: ['a'] })).toBe(false);
    expect(mayReadResource(admin, 'super_admin', 'admin.access', {})).toBe(false);
  });
});

describe('hospital scope contract (not yet connected to a membership API)', () => {
  const now = Date.parse('2026-11-03T00:00:00Z');
  const grant: HospitalGrant = { userId: 'a', role: 'branch_doctor', organizationId: 'org-a', branchIds: ['branch-a'], modules: ['clinical'], status: 'active', expiresAt: null };
  const target = { organizationId: 'org-a', branchId: 'branch-a', module: 'clinical', assignedUserIds: ['a'] };
  it.each(hospitalRoles)('requires both membership scope and an explicit module for %s', role => {
    const module = hospitalRoleModules[role][0];
    const membership = { ...grant, role, modules: [module] };
    expect(mayReadHospitalModule('a', membership, { ...target, module }, now)).toBe(true);
    expect(mayReadHospitalModule('a', { ...membership, modules: [] }, { ...target, module }, now)).toBe(false);
    expect(mayReadHospitalModule('a', membership, { ...target, module, organizationId: 'org-b' }, now)).toBe(false);
    expect(mayReadHospitalModule('a', membership, { ...target, module, branchId: 'branch-b' }, now)).toBe(false);
  });
  it('does not accept a different actor, invalid expiry, expired or inactive membership', () => {
    expect(mayReadHospitalModule('b', grant, target, now)).toBe(false);
    for (const status of ['pending', 'suspended', 'revoked'] as const) expect(mayReadHospitalModule('a', { ...grant, status }, target, now)).toBe(false);
    for (const expiresAt of ['invalid', '2026-11-03T00:00:00Z', '2020-01-01']) expect(mayReadHospitalModule('a', { ...grant, expiresAt }, target, now)).toBe(false);
    expect(mayReadHospitalModule('a', { ...grant, expiresAt: '2026-12-01T00:00:00Z' }, target, now)).toBe(true);
    expect(mayReadHospitalModule('a', grant, target, NaN)).toBe(false);
  });
  it('does not grant unknown/custom roles or permit an owner to bypass clinical assignment', () => {
    expect(mayReadHospitalModule('a', { ...grant, role: 'custom-admin' }, target, now)).toBe(false);
    expect(mayReadHospitalModule('a', { ...grant, role: 'owner' }, target, now)).toBe(false);
    expect(mayReadHospitalModule('a', grant, { ...target, assignedUserIds: [] }, now)).toBe(false);
    expect(mayReadHospitalModule('a', grant, { ...target, assignedUserIds: undefined }, now)).toBe(false);
  });
});
