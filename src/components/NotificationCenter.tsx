import { Bell } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAccountSession } from '@/features/accounts/accountService';
import { identityFromAccount } from '@/features/access/accountIdentity';
import { grantedAccountRoles } from '@/features/access/roles';

// No sample clinical/order messages and no optimistic, unpersisted unread badge.
// The community panel owns recipient-scoped fetching and durable read/dismiss.
export default function NotificationCenter() {
  const state = useAccountSession(); const [params] = useSearchParams();
  const identity = identityFromAccount(state);
  if (!identity) return null;
  const roles = grantedAccountRoles(identity.roles); const requested = params.get('workspace');
  const role = roles.find(role => role === requested) ?? (roles.length === 1 ? roles[0] : null);
  return <Link to={role ? `/feed?workspace=${encodeURIComponent(role)}&panel=notifications` : '/account'}
    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    aria-label={role ? 'Your community notifications' : 'Choose a workspace for notifications'}><Bell className="h-5 w-5" aria-hidden="true" /></Link>;
}
