import { z } from 'zod';
import { catalogSchema,managementSchema,productSchema,type CommerceSource,type CommercePayload,type CommerceAction } from './model';
export type CommerceTransport=(action:CommerceAction,payload:CommercePayload,signal?:AbortSignal)=>Promise<{data:unknown;error:unknown}>;
export function createCommerceSource(transport:CommerceTransport,workspace:string):CommerceSource {
 return{async request(action,payload={},signal){
  if(signal?.aborted)throw new DOMException('Cancelled catalog request','AbortError');
  const response=await transport(action,{...payload,workspace},signal);
  if(signal?.aborted)throw new DOMException('Cancelled catalog request','AbortError');
  if(response.error)throw new Error('The catalog request could not be completed. Check your access and connection, then reload and try again.');
  if(action==='catalog')return catalogSchema.parse(response.data);
  if(action==='product')return z.object({product:productSchema.nullable()}).strict().parse(response.data);
  if(action==='manage')return managementSchema.parse(response.data);
  return z.object({id:z.string().uuid()}).strict().parse(response.data);
 }};
}
