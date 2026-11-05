import { usePageSEO } from '@/hooks/usePageSEO';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAccountSession } from '@/features/accounts/accountService';
import { WorkspaceGuard } from '@/features/access/Workspace';
import { isAccountRole } from '@/features/access/roles';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { CommunityPortal } from './CommunityPortal';
import { createCommunitySource } from './gateway';
// Proposed RPC contract stays separate from the generated live schema until
// candidate deployment. The app's FeaturePreviewBoundary still contains /feed.
type CommunityDatabase = { public: { Tables: Record<never, never>; Views: Record<never, never>; Functions: { community_portal: { Args: { p_action: string; p_payload: Json }; Returns: Json } }; Enums: Record<never, never>; CompositeTypes: Record<never, never> } };
type CommunityClient = Pick<SupabaseClient<CommunityDatabase>, 'rpc'>;
const client = supabase as unknown as CommunityClient;
export default function CommunityRoute() {
  usePageSEO({title:'Community',description:'Conversations and updates for your Ayuzee workspace.',noIndex:true});
  const state = useAccountSession(); const [params] = useSearchParams();
  const requested = params.get('workspace');
  const role = requested ?? (state.account?.roles.length === 1 ? state.account.roles[0] : undefined);
  const source = useMemo(() => createCommunitySource(async (action, payload, signal) => {
    const query = client.rpc('community_portal', { p_action: action, p_payload: payload as Json });
    return signal ? await query.abortSignal(signal) : await query;
  }, role ?? ''), [role]);
  const valid = isAccountRole(role);
  return <WorkspaceGuard role={role}>{valid && <CommunityPortal key={`${state.session?.user.id}:${role}:${state.revision}`} source={source} contextKey={`${state.session?.user.id}:${role}:${state.revision}`} embedded />}</WorkspaceGuard>;
}
