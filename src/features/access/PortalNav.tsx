import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { useAccountSession } from '@/features/accounts/accountService';
import { identityFromAccount } from './accountIdentity';
import { features, mayEnterWorkspace, roleFeatures } from './policy';
import { grantedAccountRoles, roleLabels, workspacePath } from './roles';

const link = 'inline-flex min-h-12 items-center rounded-lg px-3 py-2 text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:bg-primary/5';
const publicLinks = [['Find a doctor','/doctors'],['About Ayuzee','/about-us'],['Guides','/guides'],['Contact','/contact']] as const;

function useNavigationWorkspace() {
  const state=useAccountSession();
  const {pathname}=useLocation();
  const identity=identityFromAccount(state);
  const grants=identity ? grantedAccountRoles(identity.roles) : [];
  const requested=/^\/workspace\/([^/]+)(?:\/|$)/.exec(pathname)?.[1];
  const active=mayEnterWorkspace(identity,requested) ? requested : grants.length===1 ? grants[0] : null;
  return {state,active,grants};
}

// Multiple grants do not merge unrelated tools; choose a workspace explicitly.
export function WorkspaceNavigationLinks({className=link}:{className?:string}) {
  const {state,active,grants}=useNavigationWorkspace();
  if(state.loading)return <p role="status" className="py-3 text-base text-muted-foreground">Checking account access…</p>;
  if(!active)return <Link className={className} to={state.session?'/account':'/auth?mode=login'}>{grants.length>1?'Choose your workspace':state.session?'Your account':'Sign in'}</Link>;
  return <>
    <Link className={className} to={workspacePath(active)}>{roleLabels[active]} workspace</Link>
    {roleFeatures[active].map(id=><Link className={className} key={id} to={`${workspacePath(active)}/${id}`}>{features[id].title}</Link>)}
  </>;
}

export function PortalNav({appLevel=false}:{appLevel?:boolean}) {
  const {pathname}=useLocation();
  const {state,active,grants}=useNavigationWorkspace();
  const [open,setOpen]=useState(false);
  const toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{setOpen(false);},[pathname,state.session?.user.id,state.revision]);
  useEffect(()=>{
    if(!open)return;
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}};
    document.addEventListener('keydown',close);
    return ()=>document.removeEventListener('keydown',close);
  },[open]);
  const accountPath=state.session?'/account':'/auth?mode=login';
  return <header className="relative z-40 border-b border-border bg-background">
    <a href="#main-content" className="sr-only z-50 rounded-lg bg-background px-4 py-3 text-base focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Skip to main content</a>
    <div className="container flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
      <Link to="/" aria-label="Ayuzee home" className={`${link} gap-2 px-0 text-2xl font-semibold text-primary`}><Leaf aria-hidden="true" size={28}/>Ayuzee</Link>
      <nav aria-label="Main navigation" className="hidden flex-wrap items-center gap-1 lg:flex">{publicLinks.map(([label,to])=><NavLink key={to} className={link} to={to}>{label}</NavLink>)}</nav>
      <div className="flex items-center gap-2">
        <Link className={`${link} border border-border`} to={accountPath}>{state.session?'Account':'Sign in'}</Link>
        <button ref={toggle} type="button" aria-expanded={open} aria-controls="ayuzee-navigation" onClick={()=>setOpen(!open)} className={`${link} gap-2 border border-border lg:hidden`}>{open?<X aria-hidden="true" size={20}/>:<Menu aria-hidden="true" size={20}/>}Menu</button>
      </div>
    </div>
    <div id="ayuzee-navigation" className={`${open?'block':'hidden'} border-t border-border bg-primary/5 lg:block`}>
      <div className="container py-3">
        <nav aria-label="Explore Ayuzee" className="mb-3 flex flex-wrap gap-1 lg:hidden">{publicLinks.map(([label,to])=><Link key={to} className={link} to={to}>{label}</Link>)}</nav>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-sm font-semibold text-muted-foreground">{active?roleLabels[active]:'Your Ayuzee'}</span>
          <nav aria-label="Your workspace" className="flex flex-wrap gap-1"><WorkspaceNavigationLinks/></nav>
          {grants.length>1&&active&&<Link className={`${link} underline`} to="/account">Switch workspace</Link>}
          <span className="rounded-full border border-border bg-background px-3 py-1 text-sm">Services preview</span>
        </div>
        {appLevel&&<p className="mt-2 text-sm text-muted-foreground">Only workspaces assigned to your account are available.</p>}
      </div>
    </div>
  </header>;
}
