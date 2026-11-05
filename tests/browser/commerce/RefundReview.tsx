import{useMemo,useState}from'react';
import{Link}from'react-router-dom';
import{OrderResolution}from'../../../src/features/commerce/ResolutionUI';
import{createResolutionSource}from'../../../src/features/commerce/resolutionGateway';
import{refundIntents}from'../../../src/features/commerce/refundIntent';
import{resolutionSchema,type Resolution}from'../../../src/features/commerce/resolutionModel';
const key='ayuzee-refund-review-v1',id='30000000-0000-4000-8000-000000000001';
const seed=():Resolution=>({order_id:id,order_status:'confirmed',cancelled:false,payments:[{payment_id:'pay_fixture123',captured_paise:24900,reserved_paise:0,processed_paise:0,review_required:false}],refunds:[]});
export function RefundReview({operations=false}:{operations?:boolean}){
 const[data,setData]=useState(()=>{try{return resolutionSchema.parse(JSON.parse(localStorage.getItem(key)??'null'));}catch{return seed();}});const intents=useMemo(()=>refundIntents('fictional-review:admin',sessionStorage),[]);
 const source=useMemo(()=>createResolutionSource(async(action,payload)=>{if(payload.order_id!==id)return{data:null,error:{code:'42501'}};let next=structuredClone(data);
 if(action==='cancel'){next.cancelled=true;next.order_status='cancelled';}
 if(action==='request'){if(!operations)return{data:null,error:{code:'42501'}};if(!next.cancelled)return{data:null,error:{code:'P5401'}};const amount=payload.amount_paise as number,request=payload.request_key as string;const existing=next.refunds.find(r=>r.id===request);if(existing){if(existing.amount_paise!==amount)return{data:null,error:{code:'P5402'}};}else{if(amount+next.payments[0].reserved_paise>24900)return{data:null,error:{code:'P5402'}};next.payments[0].reserved_paise+=amount;next.refunds.unshift({id:request,payment_id:'pay_fixture123',amount_paise:amount,currency:'INR',state:'requested',created_at:new Date().toISOString(),last_checked_at:null,last_code:null});}}
 if(action==='reauthorize'&&!operations)return{data:null,error:{code:'42501'}};
 if(action!=='status'){localStorage.setItem(key,JSON.stringify(next));setData(next);}else next=data;return{data:next,error:null};},operations?'admin':'patient'),[data,operations]);
 function advance(){const next=structuredClone(data),r=next.refunds.find(x=>x.state==='requested'||x.state==='pending');if(!r)return;r.state=r.state==='requested'?'pending':'processed';r.last_checked_at=new Date().toISOString();r.last_code='ok';next.payments[0].processed_paise=next.refunds.filter(x=>x.state==='processed').reduce((n,x)=>n+x.amount_paise,0);localStorage.setItem(key,JSON.stringify(next));location.reload();}
 return <><div className="bg-amber-50 px-5 py-3 text-sm border-b">Fictional local cancellation/refund review. No provider, charge or refund API is called.<div className="flex flex-wrap gap-3 mt-3"><Link className="underline" to={`/shop/refunds?workspace=admin&order_id=${id}`}>Sample refund operations</Link><Link className="underline" to={`/shop/resolution?workspace=patient&order_id=${id}`}>Sample buyer refund status</Link><button className="underline" onClick={advance}>Record next fictional refund update</button><button className="underline" onClick={()=>{localStorage.removeItem(key);intents.clear(id);location.reload();}}>Reset sample refunds</button></div></div><OrderResolution source={source} contextKey={operations?'fictional-refund-ops':'fictional-refund-buyer'} workspace={operations?'admin':'patient'} operations={operations} intents={intents} review/></>;
}
