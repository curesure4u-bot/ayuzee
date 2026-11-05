// Server-only local candidate. No Deno.serve entrypoint or live activation.
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
import {attemptSchema,providerOrder,providerPayment,callbackSchema,PaymentError,type Attempt,type WorkerRepository,type PaymentProvider} from './contracts';
const eventSchema=z.object({account_id:z.string(),event:z.enum(['payment.captured','payment.authorized','payment.failed','order.paid']),payload:z.object({payment:z.object({entity:z.object({id:z.string().regex(/^pay_[A-Za-z0-9]{3,80}$/),order_id:z.string().regex(/^order_[A-Za-z0-9]{3,80}$/)})})})});
const inboxRow=z.object({integration:z.string(),event_id:z.string(),payment_id:z.string(),provider_order_id:z.string(),lease_token:z.string().uuid(),attempts:z.number()});
export function validSignature(body:string|Uint8Array,signature:string,secret:string){if(!/^[a-f0-9]{64}$/.test(signature)||!secret)return false;return timingSafeEqual(createHmac('sha256',secret).update(body).digest(),Buffer.from(signature,'hex'));}
export function createPaymentService(deps:{enabled?:boolean;integration:string;merchantAccount:string;keySecret:string;webhookSecrets:string[];provider:PaymentProvider;worker:WorkerRepository}){
 const {provider,worker}=deps;
 function enabled(){if(deps.enabled!==true||!/^rzp_test_[A-Za-z0-9]{3,80}$/.test(deps.integration)||!deps.keySecret||!deps.webhookSecrets.length||deps.webhookSecrets.some(s=>!s)||!deps.merchantAccount)throw new PaymentError('PAYMENTS_DISABLED');}
 const call=(action:string,payload:Record<string,unknown>)=>worker.call(action,{...payload,integration:deps.integration});
 const get=async(id:string)=>attemptSchema.parse(await call('get',{id}));
 function orderFor(a:Attempt,value:unknown){const o=providerOrder.parse(value);if(o.receipt!==a.id||o.amount!==a.amount_paise||o.currency!==a.currency)throw new PaymentError('BINDING_MISMATCH');return o;}
 async function bind(a:Attempt,value:unknown){const o=orderFor(a,value);return attemptSchema.parse(await call('bind',{id:a.id,claim_token:a.claim_token,provider_order_id:o.id,receipt:o.receipt,amount:o.amount,currency:o.currency}));}
 async function observe(a:Attempt,paymentId:string){
  if(!a.provider_order_id)throw new PaymentError('UNBOUND');
  const payment=providerPayment.parse(await provider.payment(paymentId));const order=orderFor(a,await provider.order(a.provider_order_id));
  if(order.id!==a.provider_order_id||payment.id!==paymentId||payment.order_id!==order.id||payment.amount!==a.amount_paise||payment.currency!==a.currency)throw new PaymentError('BINDING_MISMATCH');
  if(payment.amount_refunded!==0||payment.status==='refunded')throw new PaymentError('REFUND_REVIEW_REQUIRED');
  // An authorization, failure, callback, or order.paid event is not capture proof.
  if(payment.status!=='captured'||payment.captured!==true)return{state:'awaiting_capture' as const};
  return call('settle',{id:a.id,provider_order_id:order.id,payment_id:payment.id,receipt:order.receipt,amount:payment.amount,currency:payment.currency,status:payment.status,captured:payment.captured,amount_refunded:payment.amount_refunded});
 }
 return{
  async initiate(id:string){enabled();z.string().uuid().parse(id);const existing=await get(id);if(existing.state!=='queued')return{state:existing.state};const claimed=z.object({claimed:z.boolean(),attempt:attemptSchema}).parse(await call('claim',{id:z.string().uuid().parse(id)}));if(!claimed.claimed)return{state:claimed.attempt.state};
   const a=claimed.attempt;try{return await bind(a,await provider.createOrder({amount:a.amount_paise,currency:a.currency,receipt:a.id}));}catch{await call('uncertain',{id:a.id,claim_token:a.claim_token});throw new PaymentError('CREATE_RESULT_UNCERTAIN');}
  },
  async verifyCallback(input:unknown,customer:{call(action:string,payload:Record<string,unknown>):Promise<unknown>}){enabled();const v=callbackSchema.parse(input);
   const owned=z.object({attempt:z.object({id:z.string().uuid()}).nullable()}).parse(await customer.call('status',{order_id:v.order_id,workspace:v.workspace}));if(!owned.attempt)throw new PaymentError('UNBOUND');const a=await get(owned.attempt.id);
   if(a.order_id!==v.order_id||a.provider_order_id!==v.razorpay_order_id||!validSignature(`${a.provider_order_id}|${v.razorpay_payment_id}`,v.razorpay_signature,deps.keySecret))throw new PaymentError('INVALID_SIGNATURE');
   return observe(a,v.razorpay_payment_id);
  },
  async receiveWebhook(raw:Uint8Array,signature:string,eventId:string){enabled();if(raw.length>262144||!deps.webhookSecrets.some(secret=>validSignature(raw,signature,secret)))throw new PaymentError('INVALID_SIGNATURE');
   if(!/^[A-Za-z0-9_-]{1,100}$/.test(eventId))throw new PaymentError('INVALID_EVENT_ID');
   const parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw)) as unknown;const v=eventSchema.safeParse(parsed);if(!v.success)throw new PaymentError('UNSUPPORTED_EVENT');if(v.data.account_id!==deps.merchantAccount)throw new PaymentError('ACCOUNT_MISMATCH');
   return call('inbox',{event_id:eventId,body_hash:createHash('sha256').update(raw).digest('hex'),provider_order_id:v.data.payload.payment.entity.order_id,payment_id:v.data.payload.payment.entity.id,event_type:v.data.event});
  },
  async processInbox(){enabled();const rows=z.array(inboxRow).max(20).parse(await call('claim_events',{}));const outcomes:{event_id:string;code:string}[]=[];
   for(const row of rows){let code='done';try{const data=await call('lookup',{provider_order_id:row.provider_order_id});if(!data){code='unbound';}else{const a=attemptSchema.parse(data);const result=await observe(a,row.payment_id);if(result&&typeof result==='object'&&'state'in result&&result.state==='awaiting_capture')code='retry';}}
    catch(e){code=e instanceof PaymentError&&e.code==='BINDING_MISMATCH'?'invalid':'retry';}
    await call('finish_event',{event_id:row.event_id,lease_token:row.lease_token,code});outcomes.push({event_id:row.event_id,code});
   }return outcomes;
  },
  async reconcile(){enabled();const rows=z.array(attemptSchema).max(20).parse(await call('list',{}));const outcomes:{id:string;state:string}[]=[];
   for(let a of rows){try{if(!a.provider_order_id){const candidates=(await provider.ordersByReceipt(a.id)).map(x=>providerOrder.parse(x)).filter(o=>o.receipt===a.id);if(candidates.length!==1){outcomes.push({id:a.id,state:'review_required'});continue;}a=await bind(a,candidates[0]);}
    const payments=z.array(providerPayment).max(100).parse(await provider.paymentsForOrder(a.provider_order_id!));for(const p of payments){if(p.order_id!==a.provider_order_id)throw new PaymentError('BINDING_MISMATCH');if(p.status==='captured'&&p.captured)await observe(a,p.id);}outcomes.push({id:a.id,state:'checked'});
   }catch{outcomes.push({id:a.id,state:'retry'});}finally{await call('checked',{id:a.id});}}
   return outcomes;
  },
 };
}
