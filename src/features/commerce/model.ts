import { z } from 'zod';
export const CATALOG_PAGE_SIZE = 12;
export const money = z.number().int().min(1).max(100000000);
export const productSchema = z.object({
 id:z.string().uuid(),name:z.string().min(1).max(160),description:z.string().max(4000),category:z.string().max(80),system:z.string().max(60),
 price_paise:money,mrp_paise:money.nullable(),available:z.boolean(),image_url:z.string().nullable(),prescription_required:z.boolean(),created_at:z.string().datetime({offset:true}).nullable(),
}).strict().superRefine((p,ctx)=>{if(p.mrp_paise!==null&&p.mrp_paise<p.price_paise)ctx.addIssue({code:'custom',path:['mrp_paise'],message:'Invalid reference price'});});
export type CatalogProduct=z.infer<typeof productSchema>;
export const catalogSchema=z.object({products:z.array(productSchema).max(CATALOG_PAGE_SIZE),hasMore:z.boolean(),categories:z.array(z.string().max(80)).max(100),systems:z.array(z.string().max(60)).max(100)}).strict();
export const managedProductSchema=z.object({id:z.string().uuid(),name:z.string(),description:z.string(),category:z.string(),system:z.string(),price_paise:money,mrp_paise:money.nullable(),review_reason:z.string().max(1000).nullable(),stock:z.number().int().nonnegative().nullable(),prescription_required:z.boolean().nullable(),status:z.enum(['pending','approved','rejected']),active:z.boolean().nullable(),mine:z.boolean(),revision:z.string().regex(/^[a-f0-9]{32}$/)}).strict();
export type ManagedProduct=z.infer<typeof managedProductSchema>;
export const managementSchema=z.object({viewer:z.object({id:z.string().uuid(),workspace:z.enum(['manufacturer','product_admin','admin','super_admin']),reviewer:z.boolean(),manufacturer:z.boolean()}).strict(),products:z.array(managedProductSchema).max(CATALOG_PAGE_SIZE),hasMore:z.boolean()}).strict();
export type CommerceViewer=z.infer<typeof managementSchema>['viewer'];
export type CatalogSort='name'|'price_low'|'price_high'|'recent';
export interface CatalogFilters {query:string;category:string;system:string;inStock:boolean;sort:CatalogSort;page:number}
export function catalogFilters(params:URLSearchParams):CatalogFilters {
 const page=Number(params.get('page'));const sort=params.get('sort');return{query:(params.get('q')??'').trim().slice(0,100),category:(params.get('category')??'').slice(0,80),system:(params.get('system')??'').slice(0,60),inStock:params.get('stock')==='1',sort:sort==='price_low'||sort==='price_high'||sort==='recent'?sort:'name',page:Number.isSafeInteger(page)&&page>0&&page<=1000?page:1};
}
export function rupeesToPaise(value:string):number|null {
 const s=value.trim();if(!/^\d{1,7}(\.\d{1,2})?$/.test(s))return null;const [whole,fraction='']=s.split('.');const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));return Number.isSafeInteger(n)&&n>0&&n<=100000000?n:null;
}
export const formatPrice=(paise:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:paise%100===0?0:2}).format(paise/100);
export function productImage(value:string|null):string|null {
 if(!value)return null;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
export const productDraftSchema=z.object({name:z.string().trim().min(3,'Use at least 3 characters for the product name.').max(160),description:z.string().trim().min(10,'Describe the product in at least 10 characters.').max(4000),category:z.string().trim().min(1).max(80),system:z.string().trim().min(1).max(60),price_paise:money,mrp_paise:money.nullable(),stock:z.number().int().min(0).max(10000000),prescription_required:z.boolean()}).superRefine((p,c)=>{if(p.mrp_paise!==null&&p.mrp_paise<p.price_paise)c.addIssue({code:'custom',path:['mrp_paise'],message:'MRP cannot be lower than the selling price.'});});
export type ProductDraft=z.infer<typeof productDraftSchema>;
export type CommerceAction='catalog'|'product'|'manage'|'submit'|'review';
export type CommercePayload=Record<string,string|number|boolean|null>;
export interface CommerceSource {request(action:CommerceAction,payload?:CommercePayload,signal?:AbortSignal):Promise<unknown>}
