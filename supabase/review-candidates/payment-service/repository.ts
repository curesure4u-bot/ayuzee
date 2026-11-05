import {PaymentError,type WorkerRepository} from './contracts';
type Rpc=(name:'commerce_payment'|'commerce_payment_worker',args:{p_action:string;p_payload:Record<string,unknown>})=>PromiseLike<{data:unknown;error:unknown}>;
// Pass a caller JWT client for customer and a server-only client for worker.
export function paymentRepository(rpc:Rpc,kind:'customer'|'worker'):WorkerRepository{return{async call(action,payload){const r=await rpc(kind==='worker'?'commerce_payment_worker':'commerce_payment',{p_action:action,p_payload:payload});if(r.error)throw new PaymentError('DATABASE_UNAVAILABLE');return r.data;}};}
