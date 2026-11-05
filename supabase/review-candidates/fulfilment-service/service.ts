// Local provider-neutral contract, deliberately restricted to fictional couriers.
// No provider network transport, credentials or deployed entrypoint is included.
import {createHash} from 'node:crypto';
import {z} from 'zod';
const parcel=z.object({weight_g:z.number().int().min(1).max(100000),length_cm:z.number().int().min(1).max(200),width_cm:z.number().int().min(1).max(200),height_cm:z.number().int().min(1).max(200)}).strict();
const address=z.object({full_name:z.string(),phone:z.string(),address_line1:z.string(),address_line2:z.string(),city:z.string(),state:z.string(),pincode:z.string()}).strict();
export const bookingSchema=z.object({reference:z.string().uuid(),booking_id:z.string().regex(/^fixture_[A-Za-z0-9_-]{3,80}$/),tracking_code:z.string().regex(/^[A-Za-z0-9-]{4,40}$/)}).strict();
export const observationSchema=bookingSchema.extend({event_id:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),state:z.enum(['booked','in_transit','out_for_delivery','delivery_exception','delivered','return_in_transit','returned']),occurred_at:z.string().datetime({offset:true})}).strict();
export const shipmentSchema=z.object({id:z.string().uuid(),order_id:z.string().uuid(),state:z.string(),revision:z.coerce.number().int(),parcel:parcel.nullable(),integration:z.string(),pickup_code:z.string(),claim_token:z.string().uuid().nullable(),booking_id:z.string().nullable(),tracking_code:z.string().nullable(),needs_review:z.boolean()});
export type Booking=z.infer<typeof bookingSchema>;
export type Observation=z.infer<typeof observationSchema>;
export interface CourierProvider{
 create(input:{reference:string;pickup_code:string;parcel:z.infer<typeof parcel>;delivery:z.infer<typeof address>}):Promise<unknown>;
 find(reference:string):Promise<unknown[]>;
 track(booking:Booking):Promise<unknown>;
}
export interface FulfilmentWorker{call(action:string,payload:Record<string,unknown>):Promise<unknown>;}
export class CourierError extends Error{code:string;constructor(code:string){super(code);this.name='CourierError';this.code=code;}}
export function createCourierService(deps:{enabled?:boolean;integration:string;provider?:CourierProvider;worker:FulfilmentWorker}){
 const call=(action:string,payload:Record<string,unknown>)=>deps.worker.call(action,{...payload,integration:deps.integration});
 function ready(){if(deps.enabled!==true||!/^fixture_[A-Za-z0-9_-]{3,60}$/.test(deps.integration)||!deps.provider)throw new CourierError('COURIER_UNAVAILABLE');return deps.provider;}
 async function bind(id:string,claim_token:string|null,value:unknown){const b=bookingSchema.parse(value);if(b.reference!==id)throw new CourierError('BINDING_MISMATCH');return shipmentSchema.parse(await call('bind',{id,claim_token,...b}));}
 async function book(id:string){const provider=ready();z.string().uuid().parse(id);const result=z.object({claimed:z.boolean(),shipment:shipmentSchema,delivery:address.optional()}).parse(await call('claim',{id}));if(!result.claimed)return result.shipment;
  const f=result.shipment;if(!f.parcel||!result.delivery)throw new CourierError('INVALID_DISPATCH_DATA');
  try{return await bind(f.id,f.claim_token,await provider.create({reference:f.id,pickup_code:f.pickup_code,parcel:f.parcel,delivery:result.delivery}));}
  catch{await call('uncertain',{id:f.id,claim_token:f.claim_token});throw new CourierError('BOOKING_RESULT_UNCERTAIN');}
 }
 return{book,async sync(){const provider=ready();const rows=z.array(shipmentSchema).max(20).parse(await call('list',{}));const results:{id:string;code:string}[]=[];
  for(let f of rows){let code='ok';try{
   if(f.state==='queued')f=await book(f.id);
   if(!f.booking_id){const matches=(await provider.find(f.id)).map(v=>bookingSchema.parse(v)).filter(b=>b.reference===f.id);if(matches.length!==1){code='uncertain';continue;}f=await bind(f.id,f.claim_token,matches[0]);}
   const b=bookingSchema.parse({reference:f.id,booking_id:f.booking_id,tracking_code:f.tracking_code});const value=observationSchema.parse(await provider.track(b));if(value.reference!==b.reference||value.booking_id!==b.booking_id||value.tracking_code!==b.tracking_code)throw new CourierError('BINDING_MISMATCH');
   await call('tracking',{id:f.id,...value,body_hash:createHash('sha256').update(JSON.stringify(value)).digest('hex')});
  }catch(e){code=e instanceof CourierError&&e.code==='BINDING_MISMATCH'?'binding_error':'retry';}finally{await call('checked',{id:f.id,code});results.push({id:f.id,code});}}
  return results;
 }};
}
