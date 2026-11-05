import type {SupabaseClient} from '@supabase/supabase-js';
import {supabase} from '@/integrations/supabase/client';
import type {Json} from '@/integrations/supabase/types';
import {createPaymentStatusSource} from './paymentStatus';
type PaymentDatabase={public:{Tables:Record<never,never>;Views:Record<never,never>;Functions:{commerce_payment:{Args:{p_action:string;p_payload:Json};Returns:Json}};Enums:Record<never,never>;CompositeTypes:Record<never,never>}};
export const paymentStatusSource=(workspace:string)=>createPaymentStatusSource(async(orderId,signal)=>{const q=(supabase as unknown as Pick<SupabaseClient<PaymentDatabase>,'rpc'>).rpc('commerce_payment',{p_action:'status',p_payload:{workspace,order_id:orderId}});return signal?await q.abortSignal(signal):await q;});
