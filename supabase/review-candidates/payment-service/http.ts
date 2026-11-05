import {z} from 'zod';
import {PaymentError} from './contracts';
import type {createPaymentService} from './service';
export interface CustomerRepository{call(action:string,payload:Record<string,unknown>):Promise<unknown>;}
async function bytes(req:Request,limit:number){const reader=req.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let length=0;try{for(;;){const r=await reader.read();if(r.done)break;length+=r.value.length;if(length>limit)throw new PaymentError('BODY_TOO_LARGE');chunks.push(r.value);}}finally{await reader.cancel();reader.releaseLock();}const out=new Uint8Array(length);let offset=0;for(const chunk of chunks){out.set(chunk,offset);offset+=chunk.length;}return out;}
// Authenticate must verify the bearer user (not browser user_id) and return a
// caller-JWT-scoped RPC repository. Worker credentials never go into that client.
export function createPaymentHttpHandler(deps:{enabled?:boolean;allowedOrigin:string;service:ReturnType<typeof createPaymentService>;authenticate(req:Request):Promise<CustomerRepository|null>}){
 return async(req:Request)=>{
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Origin':deps.allowedOrigin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
  const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return response({code:'METHOD_NOT_ALLOWED'},405);
  if(deps.enabled!==true)return response({code:'PAYMENTS_DISABLED'},503);
  const origin=req.headers.get('origin');if(origin&&origin!==deps.allowedOrigin)return response({code:'ORIGIN_DENIED'},403);
  try{
   if(new URL(req.url).pathname.endsWith('/webhook')){const result=await deps.service.receiveWebhook(await bytes(req,262144),req.headers.get('x-razorpay-signature')??'',req.headers.get('x-razorpay-event-id')??'');return response(result);}
   const customer=await deps.authenticate(req);if(!customer)return response({code:'UNAUTHORIZED'},401);
   const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await bytes(req,8192))) as unknown;
   if(new URL(req.url).pathname.endsWith('/verify')){await deps.service.verifyCallback(body,customer);const v=z.object({order_id:z.string().uuid(),workspace:z.string()}).parse(body);return response(await customer.call('status',v));}
   if(!new URL(req.url).pathname.endsWith('/start'))return response({code:'NOT_FOUND'},404);
   const v=z.object({order_id:z.string().uuid(),workspace:z.string().min(1).max(40)}).strict().parse(body);
   const prepared=z.object({attempt:z.object({id:z.string().uuid()})}).parse(await customer.call('prepare',v));await deps.service.initiate(prepared.attempt.id);
   // Explicitly project through the owned public RPC: no claim/session tokens.
   return response(await customer.call('status',v));
  }catch(e){if(e instanceof PaymentError){const client=['INVALID_SIGNATURE','INVALID_EVENT_ID','UNSUPPORTED_EVENT','ACCOUNT_MISMATCH','BINDING_MISMATCH','BODY_TOO_LARGE'].includes(e.code);return response({code:client?e.code:'PAYMENT_RESULT_PENDING'},client?400:503);}if(e instanceof z.ZodError||e instanceof SyntaxError)return response({code:'INVALID_REQUEST'},400);return response({code:'PAYMENT_RESULT_PENDING'},503);}
 };
}
