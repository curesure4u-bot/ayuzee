import { useSyncExternalStore } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createAccountActions, type AccountAuth } from '../../../src/features/accounts/actions';
import { createAccountStore, type AccountDetails } from '../../../src/features/accounts/sessionStore';
import { requestedType, type AccountType } from '../../../src/features/accounts/model';
import { sessionFor } from '../../../src/test/accountFixtures';

let current: Session | null = null;
let metadata: Record<string, unknown> = {};
let account: AccountDetails = { roles: ['patient'], fullName: 'Local Account', requestedRole: 'patient', completedAt: null };
const observers = new Set<(event: AuthChangeEvent, session: Session | null) => void>();
const emit = (event: AuthChangeEvent) => observers.forEach(observer => observer(event, current));
const signedIn = () => { current = sessionFor('local-fixture'); current.user.user_metadata = metadata; emit('SIGNED_IN'); return current; };
const auth = {
  signUp: async (input: { options: { data: Record<string,unknown> } }) => { metadata = input.options.data; account.fullName = String(metadata.full_name); return { data: { session: null }, error: null }; },
  signInWithPassword: async () => ({ data: { session: signedIn() }, error: null }),
  resend: async () => ({ error: null }), resetPasswordForEmail: async () => ({ error: null }),
  exchangeCodeForSession: async (code: string) => ({ data: { session: signedIn(), redirectType: code === 'recovery' ? 'recovery' : null }, error: null }),
  verifyOtp: async () => ({ data: { session: signedIn() }, error: null }), setSession: async () => ({ data: { session: signedIn() }, error: null }),
  getSession: async () => ({ data: { session: current }, error: null }), getUser: async () => ({ data: { user: current?.user }, error: null }),
  updateUser: async () => ({ error: null }), signOut: async () => { current = null; emit('SIGNED_OUT'); return { error: null }; },
};
export const accountStore = createAccountStore({ getSession: async () => current, loadAccount: async () => account,
  listen: observer => { observers.add(observer); return () => { observers.delete(observer); }; }, clearPrivateData: () => {} });
export const useAccountSession = () => useSyncExternalStore(accountStore.subscribe, accountStore.getSnapshot, accountStore.getSnapshot);
export const accountActions = createAccountActions({ auth: auth as unknown as AccountAuth, origin: () => window.location.origin,
  storage: () => sessionStorage, scrubLink: () => history.replaceState({}, '', location.pathname), clearPrivateData: accountStore.clear,
  updatePassword: async () => {} });
export async function completeOnboarding(fullName: string, type: AccountType) {
  account = { ...account, fullName, requestedRole: requestedType(type), completedAt: new Date().toISOString() };
  await accountStore.refresh();
}
