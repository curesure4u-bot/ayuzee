import type{SupabaseClient}from'@supabase/supabase-js';
import{supabase}from'@/integrations/supabase/client';
import type{Json}from'@/integrations/supabase/types';
import{createResolutionSource}from'./resolutionGateway';
type Candidate={public:{Tables:Record<never,never>;Views:Record<never,never>;Functions:{commerce_resolution:{Args:{p_action:string;p_payload:Json};Returns:Json}};Enums:Record<never,never>;CompositeTypes:Record<never,never>}};
export const resolutionSource=(workspace:string)=>createResolutionSource(async(action,payload,signal)=>{const q=(supabase as unknown as Pick<SupabaseClient<Candidate>,'rpc'>).rpc('commerce_resolution',{p_action:action,p_payload:payload as Json});return signal?await q.abortSignal(signal):await q;},workspace);
