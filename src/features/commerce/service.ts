import type {SupabaseClient} from '@supabase/supabase-js';
import {previewSupabase as supabase} from '@/integrations/preview/client';
import type {Json} from '@/integrations/supabase/types';
import {createCommerceSource} from './gateway';
// Proposed API contract is intentionally separate from generated hosted types.
// The SQL candidate is not applied and /shop remains behind the preview boundary.
type CommerceDatabase={public:{Tables:Record<never,never>;Views:Record<never,never>;Functions:{commerce_catalog:{Args:{p_action:string;p_payload:Json};Returns:Json}};Enums:Record<never,never>;CompositeTypes:Record<never,never>}};
const client=supabase as unknown as Pick<SupabaseClient<CommerceDatabase>,'rpc'>;
export function commerceSource(workspace=''){
 return createCommerceSource(async(action,payload,signal)=>{const q=client.rpc('commerce_catalog',{p_action:action,p_payload:payload});return signal?await q.abortSignal(signal):await q;},workspace);
}
export const publicCatalog=commerceSource();
