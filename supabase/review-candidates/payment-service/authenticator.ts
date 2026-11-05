import {createClient} from '@supabase/supabase-js';
import {paymentRepository} from './repository';
import {PaymentError} from './contracts';
// This checks key *type*, not user authority. User identity is verified by Auth;
// current session/grants are independently rechecked by the customer RPC.
function publicKey(key:string){if(/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))return true;try{return JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString('utf8')).role==='anon';}catch{return false;}}
export function supabasePaymentAuthenticator(config:{url:string;publishableKey:string}){
 const url=new URL(config.url);if((url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)))||!publicKey(config.publishableKey))throw new PaymentError('INVALID_AUTH_CONFIGURATION');
 return async(req:Request)=>{
  const header=req.headers.get('authorization');if(!header||!/^Bearer [A-Za-z0-9._-]{20,8192}$/.test(header))return null;
  const token=header.slice(7);const client=createClient(config.url,config.publishableKey,{global:{headers:{Authorization:header}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const r=await client.auth.getUser(token);if(r.error||!r.data.user)return null;
  return paymentRepository((name,args)=>client.rpc(name,args),'customer');
 };
}
