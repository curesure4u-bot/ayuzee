import { accountStore, useAccountSession } from '@/features/accounts/accountService';
import { accountLabels, dashboardPathForRole, primaryRole, type AppRole } from '@/features/accounts/model';
export type { AppRole } from '@/features/accounts/model';
export { dashboardPathForRole };
export const labelForRole = (role: AppRole) => role ? accountLabels[role] : 'Account';
export async function getUserPrimaryRole(userId: string): Promise<AppRole> {
  if (!accountStore.getSnapshot().account) await accountStore.refresh();
  const state = accountStore.getSnapshot();
  if (state.session?.user.id !== userId || !state.account || state.error) throw new Error('Account permissions unavailable');
  return primaryRole(state.account.roles);
}
export const getDashboardPathForUser = async (userId: string) => dashboardPathForRole(await getUserPrimaryRole(userId));
export function useUserRole() {
  const state = useAccountSession();
  return { role: !state.loading && !state.error && state.session && state.account ? primaryRole(state.account.roles) : null, loading: state.loading, error: state.error };
}
