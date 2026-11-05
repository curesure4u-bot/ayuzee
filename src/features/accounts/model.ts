import { grantedAccountRoles, roleLabels, workspacePath, type AccountRole } from '@/features/access/roles';

export const accountTypes = ['patient', 'doctor', 'student', 'therapist', 'provider', 'venue_owner'] as const;
export type AccountType = typeof accountTypes[number];
export type AppRole = AccountRole | null;
export const accountLabels = roleLabels;
const priority: AccountRole[] = ['super_admin', 'admin', 'doctor', 'therapist', 'provider', 'venue_owner', 'manufacturer',
  'product_admin', 'blog_admin', 'content_admin', 'orders_admin', 'accounts_admin', 'doctor_admin', 'ayush_admin', 'support_admin', 'student', 'patient'];
export function primaryRole(roles: readonly string[]): AppRole {
  const granted = grantedAccountRoles(roles);
  return priority.find(role => granted.includes(role)) ?? null;
}
export function dashboardPathForRole(role: AppRole): string {
  return role ? workspacePath(role) : '/account';
}
export function requestedType(value: unknown): AccountType {
  return accountTypes.find(type => type === value) ?? 'patient';
}
export const accountEntryPath = (type: AccountType) => ({ patient: '/auth', doctor: '/doctor/auth', student: '/student/auth', therapist: '/therapist/auth', provider: '/provider/auth', venue_owner: '/venue/auth' })[type];
export function accountError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : null;
  if (status === 429 || code.includes('rate_limit')) return 'Too many requests. Please wait a few minutes and try again.';
  if (code === 'email_not_confirmed') return 'Confirm your email before signing in. You can request another confirmation email.';
  if (code === 'invalid_credentials') return 'The email or password was not recognised. Check them or reset your password.';
  if (code === 'weak_password') return 'Choose a stronger password with at least 8 characters.';
  if (code === 'account_changed') return 'The signed-in account changed. Return to account access and request a new reset link.';
  if (code === 'account_changed_after_reset') return 'The original account password was updated, and the signed-in account has changed. Return to account access.';
  if (code === 'otp_expired' || code === 'flow_state_expired' || code === 'flow_state_not_found') return 'This link is invalid or has expired. Request a new email link.';
  return 'We could not complete that request. Check your connection and try again.';
}
export function validatePassword(password: string, confirmation?: string): string | null {
  if (password.length < 8 || password.length > 72) return 'Use between 8 and 72 characters for your password.';
  if (confirmation !== undefined && password !== confirmation) return 'The passwords do not match.';
  return null;
}
