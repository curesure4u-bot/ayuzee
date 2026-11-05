// Fictional browser/test data only. Never imported by production routes.
import{createFulfilmentSource}from'../../../src/features/commerce/fulfilmentGateway';
import{FulfilmentError,type FulfilmentDetail,type FulfilmentOrder}from'../../../src/features/commerce/fulfilmentModel';
export const sampleOrderId='30000000-0000-4000-8000-000000000001';
export interface FulfilmentReviewState{rows:FulfilmentDetail[];courierConfigured:boolean;}
export function seedFulfilment():FulfilmentReviewState{return{courierConfigured:true,rows:[1,2].map(n=>({order:{order_id:`30000000-0000-4000-8000-${String(n).padStart(12,'0')}`,order_status:'confirmed',payment_status:'paid',total_paise:24900,created_at:new Date(Date.now()-n*3600000).toISOString(),eligible:true,fulfilment:null},delivery:{full_name:'Sample Buyer',phone:'9999999999',address_line1:'12 Example Road',address_line2:'',city:'Chennai',state:'Tamil Nadu',pincode:'600001'},items:[{product_id:'20000000-0000-4000-8000-000000000001',name:'Sample wellness oil',quantity:2,unit_paise:10000,line_paise:20000,catalog_revision:1}]}))};}
export function createFulfilmentReviewSource(workspace:string,state=seedFulfilment(),persist?:(s:FulfilmentReviewState)=>void){return createFulfilmentSource(async(action,payload)=>{
 const row=state.rows.find(r=>r.order.order_id===payload.order_id);const staff=['orders_admin','admin','super_admin'].includes(workspace);const owned=workspace==='patient'||staff;
 if(action==='status'){if(!owned||!row)throw new FulfilmentError('42501');return{data:row.order,error:null};}
 if(!staff)throw new FulfilmentError('42501');
 if(action==='queue'){const offset=(Number(payload.page)-1)*12;return{data:{orders:state.rows.slice(offset,offset+12).map(r=>r.order),hasMore:state.rows.length>offset+12},error:null};}
 if(!row)throw new FulfilmentError('42501');if(action==='detail')return{data:row,error:null};
 const order=row.order;const f=order.fulfilment;if(!order.eligible)throw new FulfilmentError('P5301');
 if(action==='start'){if(!f){order.order_status='processing';order.fulfilment={id:crypto.randomUUID(),state:'packing',revision:'1',tracking_code:null,mode:'fixture',needs_review:false,last_event_at:null,last_checked_at:null,last_sync_code:null,events:[]};}}
 else{if(!f||f.revision!==payload.revision)throw new FulfilmentError('P5303');if(action==='pack'&&f.state==='packing'){f.state='packed';}else if(action==='request'&&f.state==='packed'){if(!state.courierConfigured)return{data:null,error:{code:'P5300'}};f.state='queued';}else if(action!=='reauthorize'||f.state!=='queued')throw new FulfilmentError('22023');f.revision=String(Number(f.revision)+1);}
 persist?.(state);return{data:order,error:null};
 },workspace);}
export function advanceFictionalCourier(state:FulfilmentReviewState){for(const row of state.rows){const f=row.order.fulfilment;if(!f||['packing','packed','delivered','returned'].includes(f.state))continue;const next=f.state==='queued'?'booked':f.state==='booked'?'in_transit':f.state==='in_transit'?'out_for_delivery':'delivered';f.state=next;f.tracking_code='FX'+row.order.order_id.slice(-8);f.revision=String(Number(f.revision)+1);f.last_checked_at=new Date().toISOString();f.last_sync_code='ok';if(next!=='booked'){f.last_event_at=new Date().toISOString();f.events.unshift({event_id:crypto.randomUUID(),state:next,occurred_at:f.last_event_at});row.order.order_status=next==='delivered'?'delivered':'shipped';}}}
