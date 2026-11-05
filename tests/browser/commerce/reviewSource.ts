// Local-only fictional data adapter. Never imported by production routes.
import {catalogSchema,managedProductSchema,productDraftSchema,productSchema,type CatalogProduct,type ManagedProduct,type CommerceSource,type CommerceViewer} from '../../../src/features/commerce/model';
export const identities={manufacturer:{id:'00000000-0000-4000-8000-000000000001',workspace:'manufacturer',reviewer:false,manufacturer:true},product_admin:{id:'00000000-0000-4000-8000-000000000004',workspace:'product_admin',reviewer:true,manufacturer:false}} satisfies Record<string,CommerceViewer>;
type ReviewProduct=ManagedProduct&{ownerId:string;createdAt:string;image_url:string|null};
export interface CommerceReviewState {products:ReviewProduct[];audits:unknown[];counter:number}
export function seedCatalog():CommerceReviewState {
 const names=['Sample wellness oil','Sample personal care powder','Sample herbal soap','Sample skin care oil','Sample daily care kit','Sample bath powder','Sample grooming oil','Sample gentle cleanser','Sample hand care balm','Sample hair care pack','Sample body care kit','Sample bath oil','Sample care powder','Sample wash bar','Sample personal care set'];
 return {counter:1000,audits:[],products:names.map((name,n)=>({id:`20000000-0000-4000-8000-${String(n+1).padStart(12,'0')}`,name,description:'Fictional product for reviewing the catalog experience. No health benefit or certification is claimed.',category:n%2?'Personal care':'Wellness',system:n%3?'Wellness':'Ayurveda',price_paise:10000+n*2750,mrp_paise:15000+n*2750,stock:n===3?0:n+5,review_reason:null,prescription_required:n===2,status:n>=12?'pending':'approved',active:n<12,mine:false,revision:String(n+1).padStart(32,'0'),ownerId:n%2?identities.manufacturer.id:'00000000-0000-4000-8000-000000000002',createdAt:new Date(Date.now()-n*86400000).toISOString(),image_url:null}))};
}
export function createCatalogReviewSource(workspace:string,state=seedCatalog(),persist?:(s:CommerceReviewState)=>void):CommerceSource {
 const viewer=workspace in identities?identities[workspace as keyof typeof identities]:null;
 const publicRows=():CatalogProduct[]=>state.products.filter(p=>p.status==='approved'&&p.active).map(p=>productSchema.parse({id:p.id,name:p.name,description:p.description,category:p.category,system:p.system,price_paise:p.price_paise,mrp_paise:p.mrp_paise,available:(p.stock??0)>0,prescription_required:p.prescription_required!==false,image_url:p.image_url,created_at:p.createdAt}));
 const nextRevision=()=> (++state.counter).toString(16).padStart(32,'0');
 return {async request(action,payload={},signal){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(action==='catalog'){
   const all=publicRows();const rows=all.filter(p=>(!payload.query||`${p.name} ${p.description}`.toLowerCase().includes(String(payload.query).toLowerCase()))&&(!payload.category||p.category===payload.category)&&(!payload.system||p.system===payload.system)&&(!payload.inStock||p.available));
   rows.sort((a,b)=>(payload.sort==='price_low'?a.price_paise-b.price_paise:payload.sort==='price_high'?b.price_paise-a.price_paise:payload.sort==='recent'?(b.created_at??'').localeCompare(a.created_at??''):a.name.localeCompare(b.name))||a.id.localeCompare(b.id));const offset=(Number(payload.page??1)-1)*12;
   return catalogSchema.parse({products:rows.slice(offset,offset+12),hasMore:rows.length>offset+12,categories:[...new Set(all.map(p=>p.category))].sort(),systems:[...new Set(all.map(p=>p.system))].sort()});
  }
  if(action==='product')return {product:publicRows().find(p=>p.id===payload.id)??null};
  if(!viewer)throw new Error('Management denied');
  const p=state.products.find(p=>p.id===payload.id);
  if(action==='manage'){
   const rows=state.products.filter(p=>(viewer.reviewer||p.ownerId===viewer.id)&&p.status===payload.status);const offset=(Number(payload.page??1)-1)*12;
   return {viewer,products:rows.slice(offset,offset+12).map(p=>managedProductSchema.parse({id:p.id,name:p.name,description:p.description,category:p.category,system:p.system,price_paise:p.price_paise,mrp_paise:p.mrp_paise,stock:p.stock,review_reason:p.review_reason,prescription_required:p.prescription_required,status:p.status,active:p.active,mine:p.ownerId===viewer.id,revision:p.revision})),hasMore:rows.length>offset+12};
  }
  if(action==='submit'){
   if(!viewer.manufacturer)throw new Error('Denied');const draft=productDraftSchema.parse(payload);
   if(payload.id){if(!p||p.ownerId!==viewer.id||p.revision!==payload.revision)throw new Error('Stale or not owned');Object.assign(p,draft,{status:'pending',active:false,revision:nextRevision()});}
   else state.products.unshift({...draft,id:crypto.randomUUID(),ownerId:viewer.id,createdAt:new Date().toISOString(),image_url:null,revision:nextRevision(),status:'pending',active:false,mine:true,review_reason:null});
   const saved=payload.id?state.products.find(p=>p.id===payload.id)!:state.products[0];state.audits.push({productId:saved.id,actor:viewer.id,decision:'submitted'});persist?.(state);return{id:saved.id};
  }
  if(action==='review'){
   if(!viewer.reviewer||!p||p.ownerId===viewer.id||p.revision!==payload.revision||String(payload.reason).trim().length<10)throw new Error('Denied or stale');
   p.status=payload.decision==='withdrawn'?'pending':payload.decision==='approved'?'approved':'rejected';p.active=p.status==='approved';p.review_reason=String(payload.reason);p.revision=nextRevision();state.audits.push({productId:p.id,actor:viewer.id,decision:payload.decision,reason:payload.reason});persist?.(state);return{id:p.id};
  }
  throw new Error('Unknown action');
 }};
}
