import {PaymentError,type PaymentProvider} from './contracts';
// Candidate/test mode only. No payment capture/refund endpoint exists here.
// Tests inject fetch; this client is never instantiated by the deployed app.
export function razorpayTestProvider(config:{allowTestNetwork?:boolean;keyId:string;keySecret:string;fetcher?:typeof fetch}):PaymentProvider{
 const request=async(path:string,body?:Record<string,unknown>)=>{
  if(config.allowTestNetwork!==true||!/^rzp_test_[A-Za-z0-9]{3,80}$/.test(config.keyId)||!config.keySecret)throw new PaymentError('PAYMENTS_DISABLED');
  const r=await(config.fetcher??fetch)('https://api.razorpay.com/v1/'+path,{method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(10000),headers:{Authorization:'Basic '+Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64'),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const text=await r.text();if(!r.ok||text.length>262144)throw new PaymentError('PROVIDER_UNAVAILABLE');return JSON.parse(text) as unknown;
 };
 const id=(value:string,prefix:string)=>{if(!new RegExp(`^${prefix}_[A-Za-z0-9]{3,80}$`).test(value))throw new PaymentError('INVALID_PROVIDER_ID');return value;};
 async function items(path:string){const value=await request(path) as {items?:unknown[]};if(!Array.isArray(value?.items)||value.items.length>=100)throw new PaymentError('PROVIDER_RESULT_INCOMPLETE');return value.items;}
 return{createOrder:input=>request('orders',{...input,partial_payment:false}),order:value=>request('orders/'+id(value,'order')),payment:value=>request('payments/'+id(value,'pay')),ordersByReceipt:receipt=>{if(!/^[a-f0-9-]{36}$/.test(receipt))throw new PaymentError('INVALID_RECEIPT');return items('orders?receipt='+encodeURIComponent(receipt)+'&count=100');},paymentsForOrder:value=>items('orders/'+id(value,'order')+'/payments')};
}
