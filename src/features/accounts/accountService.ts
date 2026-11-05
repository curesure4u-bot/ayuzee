import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { queryClient } from '@/lib/queryClient';
import { createAccountStore, type AccountDetails } from './sessionStore';
import { createAccountActions } from './actions';
import { requestedType, type AccountType } from './model';
import { sendRecoveryPassword } from './passwordTransport';

// These RPCs now exist in the generated live schema. Runtime validation remains
// necessary for nullable values and malformed transport responses.
const onboardingRows = z.array(z.object({ full_name: z.string().nullable(), requested_role: z.string().nullable(), completed_at: z.string().nullable() }));
export const clearPrivateQueries = () => { void queryClient.cancelQueries(); queryClient.clear(); };
async function loadAccount(userId: string): Promise<AccountDetails> {
  const [roles, onboarding] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', userId),
    supabase.rpc('get_account_onboarding'),
  ]);
  if (roles.error) throw roles.error;
  if (onboarding.error) throw onboarding.error;
  const rows = onboardingRows.parse(onboarding.data);
  return { roles: (roles.data ?? []).map(row => String(row.role)), fullName: rows[0]?.full_name ?? '',
    requestedRole: requestedType(rows[0]?.requested_role), completedAt: rows[0]?.completed_at ?? null };
}
export const accountStore = createAccountStore({
  getSession: async () => { const { data, error } = await supabase.auth.getSession(); if (error) throw error; return data.session; },
  listen: callback => { const { data } = supabase.auth.onAuthStateChange(callback); return () => data.subscription.unsubscribe(); },
  loadAccount, clearPrivateData: clearPrivateQueries,
});
export const accountActions = createAccountActions({ auth: supabase.auth,
  origin: () => window.location.origin, storage: () => window.sessionStorage,
  scrubLink: () => window.history.replaceState(window.history.state, '', window.location.pathname),
  clearPrivateData: () => { accountStore.clear(); },
  updatePassword: (accessToken, password) => sendRecoveryPassword(import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, accessToken, password),
});
export const useAccountSession = () => useSyncExternalStore(accountStore.subscribe, accountStore.getSnapshot, accountStore.getSnapshot);
export async function completeOnboarding(fullName: string, requestedRole: AccountType) {
  const { error } = await supabase.rpc('complete_account_onboarding', { p_full_name: fullName, p_requested_role: requestedRole });
  if (error) throw error;
  await accountStore.refresh();
}
