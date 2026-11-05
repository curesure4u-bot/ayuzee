import{useMemo}from'react';
import{Link,useSearchParams}from'react-router-dom';
import{useAccountSession}from'@/features/accounts/accountService';
import{WorkspaceGuard}from'@/features/access/Workspace';
import{identityFromAccount}from'@/features/access/accountIdentity';
import{grantedAccountRoles,roleLabels}from'@/features/access/roles';
import{usePageSEO}from'@/hooks/usePageSEO';
import{fulfilmentSource}from'./fulfilmentService';
import{FulfilmentOperations,OrderTracking}from'./FulfilmentUI';
export function FulfilmentRoute({operations=false}:{operations?:boolean}){
 usePageSEO({title:operations?'Order fulfilment':'Your delivery status',noIndex:true});const account=useAccountSession();const identity=identityFromAccount(account);const[params,setParams]=useSearchParams();const requested=params.get('workspace');const grants=grantedAccountRoles(identity?.roles??[]);const eligible=grants.filter(r=>!operations||['orders_admin','admin','super_admin'].includes(r));const role=requested??(grants.length===1?eligible[0]:undefined);const source=useMemo(()=>fulfilmentSource(role??''),[role]);
 if(identity&&requested===null&&eligible.length>0&&grants.length>1)return <div className="commerce"><main id="commerce-main" className="shop-container"><h1 className="text-3xl mb-5">Choose your {operations?'order operations':'delivery tracking'} workspace</h1><div className="flex flex-wrap gap-3">{eligible.map(r=><button key={r} className="shop-secondary" onClick={()=>setParams(p=>{const next=new URLSearchParams(p);next.set('workspace',r);return next;})}>{roleLabels[r]}</button>)}</div><Link className="shop-secondary mt-5" to="/account">Return to account</Link></main></div>;
 const allowed=role!==undefined&&(!operations||['orders_admin','admin','super_admin'].includes(role));const key=`${identity?.userId}:${role}:${account.revision}`;
 return <WorkspaceGuard role={allowed?role:undefined}>{allowed&&(operations?<FulfilmentOperations key={key} source={source} contextKey={key} workspace={role} embedded/>:<OrderTracking key={key} source={source} contextKey={key} workspace={role} embedded/>)}</WorkspaceGuard>;
}
