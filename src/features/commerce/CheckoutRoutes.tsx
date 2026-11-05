import {useMemo} from 'react';
import {useSearchParams,Link} from 'react-router-dom';
import {usePageSEO} from '@/hooks/usePageSEO';
import {useAccountSession} from '@/features/accounts/accountService';
import {WorkspaceGuard} from '@/features/access/Workspace';
import {identityFromAccount} from '@/features/access/accountIdentity';
import {grantedAccountRoles,roleLabels} from '@/features/access/roles';
import {CartPage,CheckoutPage,ReservationHistory} from './CheckoutUI';
import {paymentStatusSource} from './paymentStatusService';
import {checkoutSource} from './checkoutService';
import {intentStorage} from './checkoutIntent';
// Unavailable persistence must fail before an order request. Never silently use
// an in-memory idempotency key that disappears on navigation or a lost response.
const unavailableStorage={getItem:()=>{throw Error('Session storage unavailable');},setItem:()=>{throw Error('Session storage unavailable');},removeItem:()=>{throw Error('Session storage unavailable');}};
export function CheckoutRoute({screen}:{screen:'cart'|'checkout'|'orders'}){
 usePageSEO({title:screen==='cart'?'Your cart':screen==='orders'?'Your reservations':'Review your reservation',noIndex:true});
 const state=useAccountSession();const [params,setParams]=useSearchParams();const identity=identityFromAccount(state);const grants=grantedAccountRoles(identity?.roles??[]);const requested=params.get('workspace');const role=requested??(grants.length===1?grants[0]:undefined);const userId=identity?.userId??'';
 const source=useMemo(()=>checkoutSource(role??''),[role]);const paymentStatus=useMemo(()=>paymentStatusSource(role??''),[role]);const intents=useMemo(()=>{let storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>;try{storage=window.sessionStorage;}catch{storage=unavailableStorage;}return intentStorage(userId,role??'',storage);},[userId,role]);
 if(identity&&requested===null&&grants.length>1)return <div className="commerce"><main id="commerce-main" className="shop-container"><h1 className="text-3xl mb-4">Choose your shopping workspace</h1><p className="mb-6">Choose one of the workspaces assigned to your account. Your orders belong to your account in every workspace.</p><div className="flex flex-wrap gap-4">{grants.map(grant=><button className="shop-secondary" key={grant} onClick={()=>setParams(current=>{const next=new URLSearchParams(current);next.set('workspace',grant);return next;})}>{roleLabels[grant]}</button>)}</div><Link className="shop-secondary mt-6" to="/account">Return to account</Link></main></div>;
 const contextKey=`${userId}:${role}:${state.revision}`;
 return <WorkspaceGuard role={role}>{role&&(screen==='cart'?<CartPage key={contextKey} source={source} contextKey={contextKey} workspace={role} embedded/>:screen==='orders'?<ReservationHistory key={contextKey} source={source} contextKey={contextKey} workspace={role} embedded/>:<CheckoutPage key={contextKey} source={source} contextKey={contextKey} workspace={role} intents={intents} paymentStatus={paymentStatus} fullName={state.account?.fullName} embedded/>)}</WorkspaceGuard>;
}
