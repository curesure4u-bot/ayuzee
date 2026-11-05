import type{SupabaseClient}from'@supabase/supabase-js';
import{supabase}from'@/integrations/supabase/client';
import type{Json}from'@/integrations/supabase/types';
import{createFulfilmentSource}from'./fulfilmentGateway';
type Candidate={public:{Tables:Record<never,never>;Views:Record<never,never>;Functions:{commerce_fulfilment:{Args:{p_action:string;p_payload:Json};Returns:Json}};Enums:Record<never,never>;CompositeTypes:Record<never,never>}};
export const fulfilmentSource=(workspace:string)=>createFulfilmentSource(async(action,payload,signal)=>{const q=(supabase as unknown as Pick<SupabaseClient<Candidate>,'rpc'>).rpc('commerce_fulfilment',{p_action:action,p_payload:payload as Json});return signal?await q.abortSignal(signal):await q;},workspace);
