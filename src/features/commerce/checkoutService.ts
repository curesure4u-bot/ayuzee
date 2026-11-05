import type{SupabaseClient}from'@supabase/supabase-js';
import{createCheckoutSource}from'./checkoutGateway';
import{cartSchema}from'./checkoutModel';
import{checkoutCart}from'./checkoutCart';
import{supabase}from'@/integrations/supabase/client';
import type{Json}from'@/integrations/supabase/types';
// Candidate-only contract: no invented additions to the generated live schema.
type CheckoutDatabase={public:{Tables:Record<never,never>;Views:Record<never,never>;Functions:{commerce_checkout:{Args:{p_action:string;p_payload:Json};Returns:Json}};Enums:Record<never,never>;CompositeTypes:Record<never,never>}};
const client=supabase as unknown as Pick<SupabaseClient<CheckoutDatabase>,'rpc'>;
export const checkoutSource=(workspace:string)=>createCheckoutSource(async(action,payload,signal)=>{const q=client.rpc('commerce_checkout',{p_action:action,p_payload:payload});return signal?await q.abortSignal(signal):await q;},workspace);
// No price/name/address/payment fields are stored in browser cart persistence.
export const currentCheckoutItems=()=>cartSchema.parse(checkoutCart.snapshot());
