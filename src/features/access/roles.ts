// Role names come from the checked-in schema, not from signup choices.
// Global account roles and hospital memberships are separate authorities.
export const accountRoles = [
  'patient', 'doctor', 'student', 'therapist', 'provider', 'venue_owner',
  'manufacturer', 'admin', 'super_admin', 'product_admin', 'blog_admin',
  'content_admin', 'orders_admin', 'accounts_admin', 'doctor_admin',
  'ayush_admin', 'support_admin',
] as const;
export type AccountRole = typeof accountRoles[number];
export const roleLabels: Record<AccountRole, string> = {
  patient: 'Patient', doctor: 'Doctor', student: 'Student', therapist: 'Therapist',
  provider: 'Service provider', venue_owner: 'Venue owner', manufacturer: 'Manufacturer',
  admin: 'Administrator', super_admin: 'Platform administrator', product_admin: 'Product administrator',
  blog_admin: 'Blog administrator', content_admin: 'Content administrator',
  orders_admin: 'Orders administrator', accounts_admin: 'Accounts administrator',
  doctor_admin: 'Doctor verification administrator', ayush_admin: 'AYUSH administrator',
  support_admin: 'Support administrator',
};
export function isAccountRole(value: unknown): value is AccountRole {
  return typeof value === 'string' && accountRoles.some(role => role === value);
}
export const grantedAccountRoles = (roles: readonly string[]): AccountRole[] =>
  accountRoles.filter(role => roles.includes(role));
export const workspacePath = (role: AccountRole) => `/workspace/${role}`;

export const hospitalRoles = [
  'owner', 'branch_admin', 'branch_doctor', 'franchise_doctor', 'therapist',
  'pharmacist', 'lab_tech', 'receptionist', 'camp_doctor', 'nurse',
  'venue_partner', 'service_provider',
] as const;
export type HospitalRole = typeof hospitalRoles[number];
export const hospitalRoleLabels: Record<HospitalRole, string> = {
  owner: 'Hospital owner', branch_admin: 'Branch administrator', branch_doctor: 'Branch doctor',
  franchise_doctor: 'Franchise doctor', therapist: 'Hospital therapist', pharmacist: 'Pharmacist',
  lab_tech: 'Laboratory technician', receptionist: 'Receptionist', camp_doctor: 'Camp doctor',
  nurse: 'Nurse', venue_partner: 'Venue partner', service_provider: 'Hospital service provider',
};
export const isHospitalRole = (value: unknown): value is HospitalRole =>
  typeof value === 'string' && hospitalRoles.some(role => role === value);
