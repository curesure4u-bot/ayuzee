import type { AccountSnapshot } from '@/features/accounts/sessionStore';
import type { PortalIdentity } from './policy';

export function identityFromAccount(state: AccountSnapshot): PortalIdentity | null {
  if (state.loading || state.error || !state.session?.user.email_confirmed_at || !state.account?.completedAt) return null;
  if (state.session.expires_at !== undefined && state.session.expires_at * 1000 <= Date.now()) return null;
  return { userId: state.session.user.id, roles: state.account.roles, ready: true };
}
