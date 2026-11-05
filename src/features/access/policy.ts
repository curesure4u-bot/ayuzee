import { grantedAccountRoles, isAccountRole, isHospitalRole, type AccountRole, type HospitalRole } from './roles';

export const features = {
  'patient.appointments': { title: 'My appointments', description: 'Your bookings and upcoming care.', scope: 'self' },
  'patient.records': { title: 'My health records', description: 'Your personal health information.', scope: 'self' },
  'doctor.cases': { title: 'Assigned patients', description: 'Care for patients assigned to you.', scope: 'assigned' },
  'doctor.schedule': { title: 'My schedule', description: 'Your professional availability and appointments.', scope: 'self' },
  'student.learning': { title: 'My learning', description: 'Your courses and learning progress.', scope: 'self' },
  'student.community': { title: 'Student community', description: 'Learning and discussion with other students.', scope: 'self' },
  'therapist.sessions': { title: 'My therapy sessions', description: 'Your assigned therapy appointments.', scope: 'assigned' },
  'therapist.schedule': { title: 'My schedule', description: 'Your therapy availability.', scope: 'self' },
  'provider.services': { title: 'My services', description: 'Services offered through your provider account.', scope: 'self' },
  'provider.requests': { title: 'Service requests', description: 'Requests assigned to your service account.', scope: 'assigned' },
  'venue.spaces': { title: 'My venues', description: 'Spaces managed by your venue account.', scope: 'self' },
  'venue.requests': { title: 'Venue requests', description: 'Requests for the venues you manage.', scope: 'assigned' },
  'manufacturer.catalog': { title: 'My product catalog', description: 'Products owned by your manufacturer account.', scope: 'self' },
  'manufacturer.requests': { title: 'My supply requests', description: 'Supply requests assigned to you.', scope: 'assigned' },
  'admin.operations': { title: 'Platform operations', description: 'Review platform operation settings.', scope: 'platform' },
  'admin.access': { title: 'Access governance', description: 'Review platform access responsibilities.', scope: 'platform' },
  'admin.products': { title: 'Product review', description: 'Your delegated product review responsibilities.', scope: 'platform' },
  'admin.blogs': { title: 'Blog review', description: 'Your delegated blog review responsibilities.', scope: 'platform' },
  'admin.content': { title: 'Content review', description: 'Your delegated content responsibilities.', scope: 'platform' },
  'admin.orders': { title: 'Order operations', description: 'Your delegated order responsibilities.', scope: 'platform' },
  'admin.accounts': { title: 'Accounts review', description: 'Your delegated accounting responsibilities.', scope: 'platform' },
  'admin.doctors': { title: 'Professional verification', description: 'Your delegated professional review responsibilities.', scope: 'platform' },
  'admin.ayush': { title: 'AYUSH content', description: 'Your delegated AYUSH responsibilities.', scope: 'platform' },
  'admin.support': { title: 'Support requests', description: 'Your delegated support responsibilities.', scope: 'assigned' },
} as const;
export type FeatureId = keyof typeof features;
// These are portal/read contracts. No write/approve/export capability is
// implied by a card, an administrator title or permission to enter a workspace.
export const roleFeatures: Record<AccountRole, readonly FeatureId[]> = {
  patient: ['patient.appointments', 'patient.records'],
  doctor: ['doctor.cases', 'doctor.schedule'], student: ['student.learning', 'student.community'],
  therapist: ['therapist.sessions', 'therapist.schedule'], provider: ['provider.services', 'provider.requests'],
  venue_owner: ['venue.spaces', 'venue.requests'], manufacturer: ['manufacturer.catalog', 'manufacturer.requests'],
  admin: ['admin.operations'], super_admin: ['admin.operations', 'admin.access'],
  product_admin: ['admin.products'], blog_admin: ['admin.blogs'], content_admin: ['admin.content'],
  orders_admin: ['admin.orders'], accounts_admin: ['admin.accounts'], doctor_admin: ['admin.doctors'],
  ayush_admin: ['admin.ayush'], support_admin: ['admin.support'],
};
export const isFeatureId = (value: unknown): value is FeatureId =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(features, value);

export interface PortalIdentity {
  userId: string;
  roles: readonly string[];
  ready: boolean;
}
export function mayEnterWorkspace(identity: PortalIdentity | null, role: unknown): role is AccountRole {
  return Boolean(identity?.ready && identity.userId && isAccountRole(role) && grantedAccountRoles(identity.roles).includes(role));
}
export function mayViewFeature(identity: PortalIdentity | null, role: unknown, feature: unknown): feature is FeatureId {
  return mayEnterWorkspace(identity, role) && isFeatureId(feature) && roleFeatures[role].includes(feature);
}
export interface ResourceScope {
  ownerUserId?: string;
  assignedUserIds?: readonly string[];
}
// Frontend contract for future server adapters. It is NOT a replacement for
// independently verified database/storage/API authorization.
export function mayReadResource(identity: PortalIdentity | null, role: unknown, feature: unknown, resource: ResourceScope): boolean {
  if (!identity || !mayViewFeature(identity, role, feature)) return false;
  switch (features[feature].scope) {
    case 'self': return resource.ownerUserId === identity.userId;
    case 'assigned': return resource.assignedUserIds?.includes(identity.userId) === true;
    // Delegated admin record scope still needs its authoritative server adapter.
    case 'platform': return false;
  }
}

export const hospitalRoleModules: Record<HospitalRole, readonly string[]> = {
  owner: ['administration', 'reports'], branch_admin: ['administration', 'reports'],
  branch_doctor: ['clinical', 'schedule'], franchise_doctor: ['clinical', 'schedule'],
  camp_doctor: ['clinical', 'schedule'], therapist: ['therapy', 'schedule'], pharmacist: ['pharmacy'],
  lab_tech: ['laboratory'], receptionist: ['registration', 'schedule'], nurse: ['nursing'],
  venue_partner: ['venues'], service_provider: ['services'],
};
export interface HospitalGrant {
  userId: string;
  role: string;
  organizationId: string;
  branchIds: readonly string[];
  modules: readonly string[];
  status: 'active' | 'pending' | 'suspended' | 'revoked';
  expiresAt: string | null;
}
export interface HospitalTarget {
  organizationId: string;
  branchId: string;
  module: string;
  assignedUserIds?: readonly string[];
}
export function mayReadHospitalModule(userId: string, grant: HospitalGrant, target: HospitalTarget, now: number): boolean {
  if (!userId || grant.userId !== userId || grant.status !== 'active' || !isHospitalRole(grant.role) || !Number.isFinite(now)) return false;
  if (!grant.organizationId || grant.organizationId !== target.organizationId || !target.branchId || !grant.branchIds.includes(target.branchId)) return false;
  if (grant.expiresAt !== null && (!Number.isFinite(Date.parse(grant.expiresAt)) || Date.parse(grant.expiresAt) <= now)) return false;
  if (!grant.modules.includes(target.module) || !hospitalRoleModules[grant.role].includes(target.module)) return false;
  // Clinical/case access requires assignment even for an owner or administrator.
  if (['clinical', 'therapy', 'nursing'].includes(target.module)) return target.assignedUserIds?.includes(userId) === true;
  return true;
}
