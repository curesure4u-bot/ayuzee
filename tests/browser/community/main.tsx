import { useState } from 'react';
import axe from 'axe-core';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunityPortal } from '../../../src/features/community/CommunityPortal';
import { createReviewSource, reviewViewers, seedCommunity } from './reviewSource';
import '../../../src/index.css';
const params = new URLSearchParams(location.search);
const workspace = params.get('workspace') ?? 'patient'; const viewer = reviewViewers[workspace] ?? reviewViewers.patient;
const key = 'ayuzee-community-review-v1';
let state = seedCommunity();
try { const saved = localStorage.getItem(key); if (saved) state = JSON.parse(saved); } catch { localStorage.removeItem(key); }
const source = createReviewSource(viewer, { state, fail: params.get('failure') === '1', persist: state => localStorage.setItem(key, JSON.stringify(state)) });
export function ReviewApp() {
 const [audit,setAudit]=useState('');
 async function check() {const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});setAudit(JSON.stringify({violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),passes:result.passes.length,incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))}));}
 return (<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><BrowserRouter>
  <details className="bg-white border-b text-sm"><summary className="px-5 py-2 cursor-pointer">Local review controls · Patient / Doctor / Moderator</summary><div role="group" className="flex flex-wrap gap-3 px-5 py-2 text-sm bg-white" aria-label="Local review controls"><span>Review as:</span><button className="underline" onClick={()=>{void check();}}>Check accessibility</button><details className="text-xs"><summary>Audit result</summary><output className="break-all" aria-label="Accessibility audit result">{audit}</output></details>{Object.keys(reviewViewers).map(role => <a key={role} className="underline" href={`/feed?workspace=${role}`}>{role === 'content_admin' ? 'Moderator' : role === 'doctor' ? 'Doctor' : 'Patient'}</a>)}<a className="underline" href="/feed?failure=1">Connection error</a><button className="underline" onClick={() => { localStorage.removeItem(key); location.href='/feed'; }}>Reset fictional data</button></div></details>
  <Routes><Route path="/feed" element={<CommunityPortal key={viewer.id} source={source} contextKey={viewer.id} review />} /><Route path="/feed/:id" element={<CommunityPortal key={viewer.id} source={source} contextKey={viewer.id} review />} /><Route path="*" element={<main className="container py-16"><h1 className="text-3xl">Outside this community review</h1><p className="mt-4">This local review contains only the community portal.</p><Link to="/feed" className="underline">Return to community</Link></main>} /></Routes>
</BrowserRouter></QueryClientProvider>);
}
createRoot(document.getElementById('root')!).render(<ReviewApp />);
