import{useMemo}from'react';
import{Link,useSearchParams}from'react-router-dom';
import{useAccountSession}from'@/features/accounts/accountService';
import{WorkspaceGuard}from'@/features/access/Workspace';
import{identityFromAccount}from'@/features/access/accountIdentity';
import{grantedAccountRoles,roleLabels}from'@/features/access/roles';
import{usePageSEO}from'@/hooks/usePageSEO';
import{OrderResolution}from'./ResolutionUI';
import{resolutionSource}from'./resolutionService';
import{refundIntents}from'./refundIntent';
const unavailable={getItem:()=>{throw Error('Storage unavailable');},setItem:()=>{throw Error('Storage unavailable');},removeItem:()=>{throw Error('Storage unavailable');}};
export function ResolutionRoute({operations=false}:{operations?:boolean}){
 usePageSEO({title:'Cancellation and refunds',noIndex:true});const account=useAccountSession(),identity=identityFromAccount(account);const[params,setParams]=useSearchParams();const grants=grantedAccountRoles(identity?.roles??[]),requested=params.get('workspace');const eligible=grants.filter(r=>!operations||['orders_admin','admin','super_admin'].includes(r));const role=requested??(grants.length===1?eligible[0]:undefined),key=`${identity?.userId}:${role}:${account.revision}`;
 const source=useMemo(()=>resolutionSource(role??''),[role]);const intents=useMemo(()=>{let storage;try{storage=window.sessionStorage;}catch{storage=unavailable;}return refundIntents(`${identity?.userId}:${role}`,storage);},[identity?.userId,role]);
 if(identity&&requested===null&&eligible.length>0&&grants.length>1)return <div className="commerce"><main id="commerce-main" className="shop-container"><h1 className="text-3xl mb-5">Choose your {operations?'refund operations':'shopping'} workspace</h1><div className="flex flex-wrap gap-3">{eligible.map(r=><button className="shop-secondary" key={r} onClick={()=>setParams(p=>{const n=new URLSearchParams(p);n.set('workspace',r);return n;})}>{roleLabels[r]}</button>)}</div><Link className="shop-secondary mt-5" to="/account">Return to account</Link></main></div>;
 const allowed=role!==undefined&&(!operations||['orders_admin','admin','super_admin'].includes(role));return <WorkspaceGuard role={allowed?role:undefined}>{allowed&&<OrderResolution key={key} source={source} contextKey={key} workspace={role} operations={operations} intents={intents} embedded/>}</WorkspaceGuard>;
}
