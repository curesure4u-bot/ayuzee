import{useSyncExternalStore}from'react';
import{cartSchema,cartLineSchema,type CartLine}from'./checkoutModel';
const storageKey='ayuzee.checkout.cart.v2';
export function createCheckoutCart(storage:Pick<Storage,'getItem'|'setItem'>|null){
 let items:CartLine[]=[];let storageFailed=false;const listeners=new Set<()=>void>();
 try{const raw=storage?.getItem(storageKey);if(raw)items=cartSchema.parse(JSON.parse(raw));else{const old=storage?.getItem('ayuzee_cart_v1');if(old){const parsed:unknown=JSON.parse(old);if(Array.isArray(parsed)){const seen=new Set<string>();items=parsed.flatMap(row=>{const value=cartLineSchema.safeParse({product_id:row?.id,quantity:row?.quantity});if(!value.success||seen.has(value.data.product_id))return[];seen.add(value.data.product_id);return[value.data];}).slice(0,20);}}}}catch{items=[];}
 const snapshot=()=>items;
 function change(next:CartLine[]){const parsed=cartSchema.parse(next);try{storage?.setItem(storageKey,JSON.stringify(parsed));}catch{storageFailed=true;}items=parsed;listeners.forEach(fn=>fn());}
 return{subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},snapshot,storageFailed:()=>storageFailed,
 add(id:string,quantity=1){const line=cartLineSchema.parse({product_id:id,quantity});const found=items.find(i=>i.product_id===line.product_id);change(found?items.map(i=>i===found?{...i,quantity:i.quantity+quantity}:i):[...items,line]);},
 quantity(id:string,quantity:number){if(!items.some(i=>i.product_id===id))return;change(items.map(i=>i.product_id===id?{...i,quantity}:i));},remove(id:string){change(items.filter(i=>i.product_id!==id));},clear(){change([]);},replace(next:CartLine[]){change(next);}};
}
const browserStorage=()=>{try{return typeof window==='undefined'?null:window.localStorage;}catch{return null;}};
export const checkoutCart=createCheckoutCart(browserStorage());
export const useCheckoutCart=()=>useSyncExternalStore(checkoutCart.subscribe,checkoutCart.snapshot,checkoutCart.snapshot);
