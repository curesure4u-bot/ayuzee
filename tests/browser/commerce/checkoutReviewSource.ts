// Fictional UI review only. PostgreSQL/native REST tests prove the real contract.
// Never imported by production routes; these delivery/coupon rules are samples.
import {CheckoutError,cartSchema,quoteSchema,receiptSchema,type CheckoutQuote,type Reservation,type CheckoutSource} from '../../../src/features/commerce/checkoutModel';
import {productSchema} from '../../../src/features/commerce/model';
import {seedCatalog,type CommerceReviewState} from './reviewSource';
export interface CheckoutReviewState{quotes:CheckoutQuote[];reservations:Reservation[];}
export const seedCheckout=():CheckoutReviewState=>({quotes:[],reservations:[]});
export function createCheckoutReviewSource(catalog:CommerceReviewState=seedCatalog(),state=seedCheckout(),persist?:(s:CheckoutReviewState)=>void):CheckoutSource{
 const available=(id:string)=>{const p=catalog.products.find(p=>p.id===id);return (p?.stock??0)-state.reservations.filter(r=>r.reservation_state==='held'&&Date.parse(r.expires_at)>Date.now()).reduce((sum,r)=>sum+(r.pricing.lines.find(l=>l.product_id===id)?.quantity??0),0);};
 function pricing(items:Parameters<CheckoutSource['quote']>[0],postal:string,coupon:string){
  if(!/^(600|560)[0-9]{3}$/.test(postal))throw new CheckoutError('P5110');
  const lines=cartSchema.parse(items).map(l=>{const p=catalog.products.find(p=>p.id===l.product_id&&p.active&&p.status==='approved');if(!p)throw new CheckoutError('P5101');if(p.prescription_required!==false)throw new CheckoutError('P5103');if(available(p.id)<l.quantity)throw new CheckoutError('P5102');return{...l,name:p.name,unit_paise:p.price_paise,line_paise:p.price_paise*l.quantity};});
  const subtotal=lines.reduce((sum,l)=>sum+l.line_paise,0);const code=coupon.trim().toUpperCase();if(code&&code!=='DEMO10')throw new CheckoutError('P5107');const discount=code?Math.min(Math.floor((subtotal*1000+5000)/10000),2000):0;const shipping=subtotal-discount>=50000?0:4900;
  return{currency:'INR' as const,tax_mode:'included' as const,coupon_code:code||null,postal_code:postal,lines,subtotal_paise:subtotal,discount_paise:discount,shipping_paise:shipping,total_paise:subtotal-discount+shipping};
 }
 return{
  async inspect(items){return{lines:items.map(l=>{const p=catalog.products.find(p=>p.id===l.product_id&&p.active&&p.status==='approved');return{...l,product:p?productSchema.parse({id:p.id,name:p.name,description:p.description,category:p.category,system:p.system,price_paise:p.price_paise,mrp_paise:p.mrp_paise,available:available(p.id)>0,prescription_required:p.prescription_required!==false,image_url:null,created_at:p.createdAt}):null,issue:!p?'unavailable' as const:p.prescription_required!==false?'prescription' as const:available(p.id)<l.quantity?'stock' as const:null};})};},
  async quote(items,postal,coupon){const q=quoteSchema.parse({...pricing(items,postal,coupon),id:crypto.randomUUID(),expires_at:new Date(Date.now()+600000).toISOString()});state.quotes.push(q);persist?.(state);return q;},
  async reserve(intent,address){const existing=state.reservations.find(r=>r.request_key===intent.request_key);if(existing){if(existing.quote_id!==intent.quote_id)throw new CheckoutError('P5109');return existing;}const q=state.quotes.find(q=>q.id===intent.quote_id);if(!q||Date.parse(q.expires_at)<=Date.now())throw new CheckoutError('P5104');if(q.postal_code!==address.pincode)throw new CheckoutError('P5106');if(state.reservations.some(r=>r.quote_id===q.id))throw new CheckoutError('P5109');const price=pricing(q.lines.map(l=>({product_id:l.product_id,quantity:l.quantity})),q.postal_code,q.coupon_code??'');if(JSON.stringify(quoteSchema.parse({...price,id:q.id,expires_at:q.expires_at}))!==JSON.stringify(q))throw new CheckoutError('P5105');const r=receiptSchema.parse({...intent,order_id:crypto.randomUUID(),payment_status:'unpaid',order_status:'pending',reservation_state:'held',expires_at:new Date(Date.now()+900000).toISOString(),pricing:price});state.reservations.unshift(r);persist?.(state);return r;},
  async recover(intent){return{reservation:state.reservations.find(r=>r.request_key===intent.request_key&&r.quote_id===intent.quote_id)??null,quote:state.quotes.find(q=>q.id===intent.quote_id)??null};},
  async status(id){const r=state.reservations.find(r=>r.order_id===id);if(!r)throw new CheckoutError('42501');return r;},
  async release(id){const r=state.reservations.find(r=>r.order_id===id);if(!r)throw new CheckoutError('42501');if(r.reservation_state==='held'){r.reservation_state=Date.parse(r.expires_at)<=Date.now()?'expired':'released';r.order_status='cancelled';persist?.(state);}return{...r};},
  async orders(page){const offset=(page-1)*12;return{reservations:state.reservations.slice(offset,offset+12),hasMore:state.reservations.length>offset+12};},
 };
}
