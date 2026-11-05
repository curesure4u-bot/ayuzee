import{z}from'zod';
const uuid=z.string().uuid(),money=z.number().int().min(1).max(1e9);
export const refundObservation=z.object({reference:uuid,payment_id:z.string().regex(/^pay_[A-Za-z0-9]{3,80}$/),provider_order_id:z.string().regex(/^order_[A-Za-z0-9]{3,80}$/),provider_refund_id:z.string().regex(/^fixture_ref_[A-Za-z0-9]{3,80}$/),amount_paise:money,currency:z.literal('INR'),state:z.enum(['pending','processed','failed'])}).strict();
export type RefundObservation=z.infer<typeof refundObservation>;
export interface RefundProvider{
 payment(id:string):Promise<{payment_id:string;provider_order_id:string;amount_paise:number;currency:string;captured:boolean;refunded_paise:number}>;
 create(input:{reference:string;payment_id:string;provider_order_id:string;amount_paise:number;currency:'INR'}):Promise<unknown>;
 find(reference:string,paymentId:string):Promise<unknown[]>;
 read(id:string):Promise<unknown>;
}
export interface RefundWorker{call(action:string,payload:Record<string,unknown>):Promise<unknown>;}
const job=z.object({id:uuid,order_id:uuid,payment_id:z.string(),payment_integration:z.string().regex(/^rzp_test_/),integration:z.string().regex(/^fixture_/),amount_paise:money,currency:z.literal('INR'),state:z.enum(['requested','creating','uncertain','pending','processed','failed']),claim_token:uuid.nullable(),provider_refund_id:z.string().nullable()});
type Job=z.infer<typeof job>;
const binding=z.object({provider_order_id:z.string(),captured_paise:money,processed_paise:z.number().int().nonnegative()});
export function createRefundService(deps:{enabled?:boolean;integration:string;worker:RefundWorker;provider?:RefundProvider}){
 function available(){if(!deps.enabled||!/^fixture_[A-Za-z0-9_]{3,80}$/.test(deps.integration)||!deps.provider)throw Error('Refund processing unavailable');return deps.provider;}
 const call=(action:string,payload:Record<string,unknown>={})=>deps.worker.call(action,{...payload,integration:deps.integration});
 async function observe(j:Job,value:unknown){const v=refundObservation.parse(value);if(v.reference!==j.id||v.payment_id!==j.payment_id||v.amount_paise!==j.amount_paise||v.currency!==j.currency)throw Error('Refund binding mismatch');return call('observe',{id:j.id,claim_token:j.claim_token,...v});}
 async function start(id:string){const provider=available();uuid.parse(id);const r=z.object({claimed:z.boolean(),refund:job.optional(),provider_order_id:z.string().optional(),captured_paise:money.optional(),processed_paise:z.number().int().nonnegative().optional()}).parse(await call('claim',{id}));if(!r.claimed)return;const j=job.parse(r.refund),b=binding.parse(r);
  try{const p=await provider.payment(j.payment_id);if(p.payment_id!==j.payment_id||p.provider_order_id!==b.provider_order_id||p.amount_paise!==b.captured_paise||p.currency!==j.currency||p.captured!==true||p.refunded_paise!==b.processed_paise||p.refunded_paise+j.amount_paise>p.amount_paise)throw Error('Captured balance needs reconciliation');
   await observe(j,await provider.create({reference:j.id,payment_id:j.payment_id,provider_order_id:b.provider_order_id,amount_paise:j.amount_paise,currency:j.currency}));
  }catch{await call('uncertain',{id:j.id,claim_token:j.claim_token});throw Error('Refund result unconfirmed; reconcile the original request');}
 }
 async function sync(){const provider=available();const jobs=z.array(job).max(20).parse(await call('list'));for(const j of jobs){try{
   if(j.state==='requested')await start(j.id);
   else if(j.state==='creating'||j.state==='uncertain'){const matches=await provider.find(j.id,j.payment_id);if(matches.length!==1){await call('checked',{id:j.id,code:'uncertain'});continue;}await observe(j,matches[0]);}
   else if(j.state==='pending'&&j.provider_refund_id)await observe(j,await provider.read(j.provider_refund_id));
   await call('checked',{id:j.id,code:'ok'});
  }catch{await call('checked',{id:j.id,code:'retry'});}}
 }
 return{start,sync};
}
