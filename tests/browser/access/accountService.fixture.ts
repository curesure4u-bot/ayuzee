// Isolated synthetic identity source. Aliased by the local review server only.
// No Supabase client, hosted credentials, browser storage or provider calls.
import { useSyncExternalStore } from 'react';
import type { AccountSnapshot } from '../../../src/features/accounts/sessionStore';
import { sessionFor } from '../../../src/test/accountFixtures';
import { queryClient } from '../../../src/lib/queryClient';
import { isAccountRole } from '../../../src/features/access/roles';

const observers = new Set<() => void>();
let state: AccountSnapshot;
function publish(next: AccountSnapshot) { state = next; observers.forEach(observer => observer()); }
export const clearPrivateQueries = () => { void queryClient.cancelQueries(); queryClient.clear(); };
export function chooseScenario(scenario: string) {
  clearPrivateQueries();
  const roles = scenario === 'multiple' ? ['patient', 'doctor'] : isAccountRole(scenario) ? [scenario] : ['patient'];
  const next: AccountSnapshot = { session: sessionFor(`synthetic-${scenario}`),
    account: { roles, fullName: 'Local review account', requestedRole: 'patient', completedAt: '2026-11-03' },
    loading: scenario === 'loading', error: scenario === 'error' ? 'Synthetic connection failure' : null, revision: (state?.revision ?? 0) + 1 };
  if (scenario === 'unknown') next.account!.roles = ['unknown-role'];
  if (scenario === 'signed-out') next.session = null;
  if (scenario === 'revoked') next.account!.roles = [];
  publish(next);
}
chooseScenario('patient');
export const useAccountSession = () => useSyncExternalStore(callback => { observers.add(callback); return () => { observers.delete(callback); }; }, () => state, () => state);
export const accountStore = { refresh: async () => { chooseScenario('patient'); } };
