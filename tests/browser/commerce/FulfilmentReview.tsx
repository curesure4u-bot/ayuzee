import{useMemo}from'react';
import{Link,useSearchParams}from'react-router-dom';
import{useQueryClient}from'@tanstack/react-query';
import{FulfilmentOperations,OrderTracking}from'../../../src/features/commerce/FulfilmentUI';
import{seedFulfilment,createFulfilmentReviewSource,advanceFictionalCourier,sampleOrderId}from'./fulfilmentReviewSource';
const storageKey='ayuzee-fulfilment-review-v1';let state=seedFulfilment();try{const saved=localStorage.getItem(storageKey);if(saved)state=JSON.parse(saved);}catch{localStorage.removeItem(storageKey);}
const persist=()=>localStorage.setItem(storageKey,JSON.stringify(state));
export function FulfilmentReview({operations=false}:{operations?:boolean}){const[params]=useSearchParams();const workspace=params.get('workspace')??(operations?'orders_admin':'patient');const source=useMemo(()=>createFulfilmentReviewSource(workspace,state,persist),[workspace]);const client=useQueryClient();
 return <><aside className="bg-amber-50 border-b px-5 py-4 text-sm"><strong>Fictional courier controls.</strong> These controls change sample data only. No parcel is booked or shipped.<div className="flex flex-wrap gap-4 mt-3"><Link className="underline" to="/shop/fulfilment?workspace=orders_admin">Sample staff queue</Link><Link className="underline" to={`/shop/track?workspace=patient&order_id=${sampleOrderId}`}>Sample buyer tracking</Link><button className="underline" onClick={()=>{advanceFictionalCourier(state);persist();void client.invalidateQueries();}}>Record next fictional courier update</button><button className="underline" onClick={()=>{state=seedFulfilment();persist();location.reload();}}>Reset sample fulfilment</button></div></aside>{operations?<FulfilmentOperations source={source} contextKey="fictional-staff" workspace={workspace} review/>:<OrderTracking source={source} contextKey="fictional-buyer" workspace={workspace} review/>}</>;
}
