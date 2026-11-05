// Real local Auth, mail sink, PKCE and API acceptance. No hosted destinations.
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {localSQL,localConfig,localClient} from '../tests/database/localSupabase.mjs';
const config=localConfig();
if(localSQL("SELECT to_regclass('public.account_onboarding') IS NULL")==='t'){
 localSQL('DROP TRIGGER IF EXISTS fixture_signup ON auth.users; DROP FUNCTION IF EXISTS public.fixture_signup()');
 localSQL(await readFile(new URL('../supabase/review-candidates/phase1-onboarding-integration.sql',import.meta.url),'utf8'));
}
const admin=localClient(config,{service:true});const user=localClient(config);
const mailbox='onboarding-'+randomUUID(),email=mailbox+'@example.invalid';
const password=randomUUID()+'Aa1!',replacement=randomUUID()+'Bb2!';
const scenarios=[];let actor;
async function mailLink(type){
 for(let attempt=0;attempt<30;attempt++){
  const response=await fetch('http://127.0.0.1:54624/api/v1/search?query='+encodeURIComponent('to:'+email));
  assert.equal(response.status,200,'Local Mailpit search unavailable');const list=await response.json();
  for(const item of list.messages){
   const message=await fetch('http://127.0.0.1:54624/api/v1/message/'+encodeURIComponent(item.ID)).then(r=>r.json());
   const text=(message.Text||'')+' '+(message.HTML||'');
   for(const match of text.matchAll(/https?:\/\/[^\s<>"']+/g)){
    const url=new URL(match[0].replaceAll('&amp;','&'));
    if(url.origin===config.api&&url.pathname==='/auth/v1/verify'&&url.searchParams.get('type')===type)return url.href;
   }
  }
  await new Promise(r=>setTimeout(r,200));
 }
 throw Error('Local '+type+' email did not arrive in the isolated mail sink');
}
async function follow(link){
 assert.equal(new URL(link).origin,config.api);
 const response=await fetch(link,{redirect:'manual'});assert.ok([302,303].includes(response.status),'Local Auth confirmation did not redirect');
 const destination=new URL(response.headers.get('location'));
 assert.equal(destination.origin,'http://127.0.0.1:4182');
 return destination;
}
try{
 const signup=await user.auth.signUp({email,password,options:{emailRedirectTo:'http://127.0.0.1:4182/auth/callback',data:{full_name:'Synthetic New Member',role:'super_admin',requested_role:'doctor'}}});
 assert.equal(signup.error,null);assert.equal(signup.data.session,null);actor=signup.data.user.id;
 assert.equal((await user.auth.signInWithPassword({email,password})).error?.code,'email_not_confirmed');
 scenarios.push('Signup requires confirmation; forged role metadata grants no session');
 const confirmation=await follow(await mailLink('signup'));
 assert.ok(confirmation.searchParams.get('code'));
 const confirmed=await user.auth.exchangeCodeForSession(confirmation.searchParams.get('code'));
 assert.equal(confirmed.error,null);assert.equal(confirmed.data.user.id,actor);
 scenarios.push('Delivered local confirmation email completes PKCE login');
 const unfinished=await user.rpc('get_account_onboarding');assert.equal(unfinished.error,null);assert.equal(unfinished.data[0].completed_at,null);
 assert.equal((await user.rpc('complete_account_onboarding',{p_full_name:'Synthetic New Member',p_requested_role:'doctor'})).error,null);
 const done=await user.rpc('get_account_onboarding');assert.ok(done.data[0].completed_at);assert.equal(done.data[0].requested_role,'doctor');
 const roles=await user.from('user_roles').select('role');assert.equal(roles.error,null);assert.deepEqual(roles.data,[{role:'patient'}]);
 scenarios.push('Onboarding persists a role request without granting professional access');
 const own=await user.from('profiles').select('user_id');assert.equal(own.error,null);assert.deepEqual(own.data,[{user_id:actor}]);
 const forbidden=await user.from('user_roles').insert({user_id:actor,role:'admin'});assert.equal(forbidden.error?.code,'42501');
 assert.equal((await user.from('hms_op_visits').select('id')).data.length,0);
 scenarios.push('Direct APIs enforce own-profile reads and deny self-promotion/clinical access');
 assert.equal((await user.auth.refreshSession()).error,null);
 const oldRefresh=(await user.auth.getSession()).data.session.refresh_token;
 assert.equal((await user.auth.signOut()).error,null);assert.equal((await user.auth.getSession()).data.session,null);
 assert.ok((await user.auth.refreshSession({refresh_token:oldRefresh})).error);
 scenarios.push('Refresh works; logout clears local session and revokes refresh');
 const recovery=localClient(config);
 assert.equal((await recovery.auth.resetPasswordForEmail(email,{redirectTo:'http://127.0.0.1:4182/reset-password'})).error,null);
 const recoveryLink=await mailLink('recovery');const callback=await follow(recoveryLink);
 assert.ok(callback.searchParams.get('code'));
 assert.equal((await recovery.auth.exchangeCodeForSession(callback.searchParams.get('code'))).error,null);
 assert.equal((await recovery.auth.updateUser({password:replacement})).error,null);
 await recovery.auth.signOut();
 assert.ok((await user.auth.signInWithPassword({email,password})).error);
 assert.equal((await user.auth.signInWithPassword({email,password:replacement})).error,null);
 scenarios.push('Delivered local recovery email resets password and enables re-entry');
 const replay=await follow(recoveryLink);assert.ok(replay.searchParams.get('error')||replay.searchParams.get('error_code')||replay.hash.includes('error'));
 scenarios.push('Used recovery link is rejected');
 await user.auth.signOut();
 const report={date:new Date().toISOString(),target:'Existing loopback-only Supabase/Auth/Mailpit stack',scenarios,passed:scenarios.length,realHostedEmailDeliveryVerified:false,liveDataUsed:false,paidResourcesUsed:false};
 await writeFile(new URL('../docs/release/onboarding-local-result.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(`Passed ${scenarios.length} local Auth/onboarding/email/PKCE scenarios. No hosted email or paid resource used.`);
}finally{
 if(actor){const removed=await admin.auth.admin.deleteUser(actor);assert.equal(removed.error,null,'Synthetic local account cleanup failed');}
 await Promise.all([user.auth.stopAutoRefresh(),admin.auth.stopAutoRefresh()]);
}
