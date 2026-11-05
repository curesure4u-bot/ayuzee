import {RefundReview} from './RefundReview';
import {FulfilmentReview} from './FulfilmentReview';
import {PaymentReview} from './PaymentReview';
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import axe from 'axe-core';
import {Catalog,CatalogDetail} from '../../../src/features/commerce/Catalog';
import {CartPage,CheckoutPage,ReservationHistory} from '../../../src/features/commerce/CheckoutUI';
import {intentStorage} from '../../../src/features/commerce/checkoutIntent';
import {createCheckoutReviewSource,seedCheckout} from './checkoutReviewSource';
import {ProductManagement} from '../../../src/features/commerce/ProductManagement';
import {createCatalogReviewSource,seedCatalog} from './reviewSource';
import '../../../src/index.css';
const params=new URLSearchParams(location.search);const workspace=params.get('workspace')??'guest';const key='ayuzee-catalog-review-v1';let state=seedCatalog();try{const saved=localStorage.getItem(key);if(saved)state=JSON.parse(saved);}catch{localStorage.removeItem(key);}
const real=createCatalogReviewSource(workspace,state,s=>localStorage.setItem(key,JSON.stringify(s)));
const source=params.get('failure')==='1'?{request:async()=>{throw new Error('Simulated connection failure');}}:real;
const checkoutKey='ayuzee-checkout-review-v1';let checkoutState=seedCheckout();try{const saved=localStorage.getItem(checkoutKey);if(saved)checkoutState=JSON.parse(saved);}catch{localStorage.removeItem(checkoutKey);}
const checkout=createCheckoutReviewSource(state,checkoutState,s=>localStorage.setItem(checkoutKey,JSON.stringify(s)));const intents=intentStorage('fictional-buyer','patient',sessionStorage);
const managementPath=workspace==='manufacturer'||workspace==='product_admin'?`/shop/manage?workspace=${workspace}`:undefined;
export function CatalogReviewApp(){const [audit,setAudit]=useState('');async function check(){const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});setAudit(JSON.stringify({violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),passes:result.passes.length,incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))}));}
 return <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><BrowserRouter><details className="bg-white border-b text-sm"><summary className="px-5 py-2 cursor-pointer">Local catalog controls · Guest / Manufacturer / Reviewer</summary><div role="group" aria-label="Local catalog controls" className="flex flex-wrap gap-4 px-5 py-3"><a className="underline" href="/shop">Guest catalog</a><a className="underline" href="/cart">Sample buyer cart</a><a className="underline" href="/payment-review">Payment status examples</a><a className="underline" href="/shop/fulfilment">Fulfilment review</a><a className="underline" href="/shop/refunds">Refund review</a><span>Checkout samples: postcode 600001 or 560001 · coupon DEMO10</span><a className="underline" href="/shop/manage?workspace=manufacturer">Manufacturer workspace</a><a className="underline" href="/shop/manage?workspace=product_admin">Product reviewer</a><a className="underline" href="/shop?failure=1">Connection error</a><button className="underline" onClick={()=>{localStorage.removeItem(key);location.href='/shop';}}>Reset fictional products</button><button className="underline" onClick={()=>{void check();}}>Check accessibility</button><output className="break-all" aria-label="Catalog audit result">{audit}</output></div></details>
  <Routes><Route path="/shop" element={<Catalog source={source} review allowCart managementPath={managementPath}/>}/><Route path="/shop/manage" element={<ProductManagement source={source} contextKey={workspace} review/>}/><Route path="/shop/:id" element={<CatalogDetail source={source} review allowCart managementPath={managementPath}/>}/><Route path="/cart" element={<CartPage source={checkout} contextKey="fictional-buyer" workspace="patient" review/>}/><Route path="/checkout" element={<CheckoutPage source={checkout} contextKey="fictional-buyer" workspace="patient" intents={intents} fullName="Sample Buyer" review/>}/><Route path="/checkout/orders" element={<ReservationHistory source={checkout} contextKey="fictional-buyer" workspace="patient" review/>}/><Route path="/shop/refunds" element={<RefundReview operations/>}/><Route path="/shop/resolution" element={<RefundReview/>}/><Route path="/shop/fulfilment" element={<FulfilmentReview operations/>}/><Route path="/shop/track" element={<FulfilmentReview/>}/><Route path="/payment-review" element={<PaymentReview/>}/><Route path="*" element={<main className="container py-16"><h1 className="text-3xl">Outside the catalog review</h1><Link className="underline" to="/shop">Return to catalog</Link></main>}/></Routes>
 </BrowserRouter></QueryClientProvider>;
}
createRoot(document.getElementById('root')!).render(<CatalogReviewApp/>);
