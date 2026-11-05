// Free, loopback-only Supabase acceptance. Never accepts a remote URL/project.
import {spawnSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash,createHmac,randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {scopedFixture,id} from '../tests/database/scoped-fixture.mjs';
const container='supabase_db_ayuzee-local-staging';
function sql(query){
 const r=spawnSync('docker',['exec','-i',container,'psql','-U','postgres','-d','postgres','-At','-v','ON_ERROR_STOP=1'],{input:query,encoding:'utf8',maxBuffer:8*1024*1024});
 if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();
}
const f=await scopedFixture({nativeAuth:true});
const exists=sql("SELECT to_regclass('public.profiles') IS NOT NULL");
if(exists==='f'){
 assert.equal(sql('SELECT count(*) FROM auth.users'),'0','Refusing to seed an occupied local stack');
 sql('BEGIN;'+f.sql+'COMMIT;');
}
if(sql("SELECT to_regprocedure('ayuzee_private.rbac_patient(uuid)') IS NOT NULL")==='f'){
 let repair=await readFile(new URL('../supabase/migrations/20261103193309_phase0_2_scoped_access.sql',import.meta.url),'utf8');
 for(const v of f.metadata.views){const hash=sql(`SELECT md5(pg_get_viewdef('public.${v.name}'::regclass,true))`);repair=repair.replace(v.fingerprint,hash);}
 await writeFile(new URL('../local-staging/supabase/scoped-access.local.sql',import.meta.url),repair);
 sql(repair);
}
if(sql("SELECT to_regprocedure('ayuzee_private.rbac_actor()') IS NOT NULL")==='f'){
 sql(await readFile(new URL('../supabase/review-candidates/phase1-auth-lifecycle.sql',import.meta.url),'utf8'));
}
const helperSource=await readFile(new URL('../supabase/review-candidates/scoped-access-helpers.sql',import.meta.url),'utf8');
const guardBody=helperSource.match(/CREATE OR REPLACE FUNCTION ayuzee_private.rbac_authority_guard\([\s\S]*?\bAS \$\$([\s\S]*?)\$\$;/)[1];
assert.equal(sql("SELECT md5(prosrc) FROM pg_proc WHERE oid='ayuzee_private.rbac_authority_guard()'::regprocedure"),createHash('md5').update(guardBody).digest('hex'),'Local helper drift: rebuild the synthetic fixture explicitly before continuing');
for(const con of f.metadata.constraints.filter(c=>c.type==='f'&&c.definition.includes('REFERENCES auth.users')&&c.table!=='profiles')){
 sql(`DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.${con.table}'::regclass AND conname='${con.name}') THEN ALTER TABLE public.${con.table} ADD CONSTRAINT ${con.name} ${con.definition}; END IF; END $$;`);
}
for(const field of ['auth_user_id','registered_by'])sql(`DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.hms_op_patients'::regclass AND conname='hms_op_patients_${field}_fkey') THEN ALTER TABLE public.hms_op_patients ADD CONSTRAINT hms_op_patients_${field}_fkey FOREIGN KEY(${field}) REFERENCES auth.users(id) ON DELETE SET NULL; END IF; END $$;`);
const status=spawnSync('node_modules/.bin/supabase',['--workdir','local-staging','status','-o','json'],{encoding:'utf8',env:{...process.env,DO_NOT_TRACK:'1',SUPABASE_NO_UPDATE_NOTIFIER:'1',SUPABASE_HOME:'/Users/sai/Codex/Ayuzee-Project-Handover/work/phase0-2-2026-11-04/cli-state'}});
assert.equal(status.status,0,status.stderr);
let config=JSON.parse(status.stdout);
if(config.result)config=config.result;
// Deliberately do not log configuration: it contains local-only credentials.
const api=config.API_URL||config.api_url; const key=config.ANON_KEY||config.anon_key; const service=config.SERVICE_ROLE_KEY||config.service_role_key; const secret=config.JWT_SECRET||config.jwt_secret;
if(!api||!key||!secret)throw Error('Unexpected local status shape: '+Object.keys(config).join(','));
assert.equal(new URL(api).hostname,'127.0.0.1');assert.equal(new URL(api).port,'54621');
function token(n){const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const data=enc({alg:'HS256',typ:'JWT'})+'.'+enc({aud:'authenticated',role:'authenticated',sub:typeof n==='string'?n:id(n),iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+600,user_metadata:{role:'super_admin'}});return data+'.'+createHmac('sha256',secret).update(data).digest('base64url');}
let checks=0;
async function request(path,n,{method='GET',body}={}){
 const res=await fetch(api+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+(n==='service'?service:n?token(n):key),'Content-Type':'application/json',Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});
 const text=await res.text(); let data;try{data=JSON.parse(text);}catch{data=text;}
 return {status:res.status,data};
}
async function rows(path,n,count){const r=await request(path,n);assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.length,count,path);checks++;return r.data;}
async function denied(path,n,options){const r=await request(path,n,options);assert.ok([401,403].includes(r.status),path+': '+r.status+' '+JSON.stringify(r.data));checks++;}
await new Promise(r=>setTimeout(r,1000));
for(const n of [1,2,3]){const p=await rows('unified_patient_directory?select=user_id',n,1);assert.equal(p[0].user_id,id(n));await rows('hms_op_visits?select=id',n,1);await rows('hms_bills?select=id',n,1);}
await rows('unified_patient_directory?select=user_id',4,1);
await rows('hms_op_visits?select=id',4,1);
await rows('hms_bills?select=id',8,1);
await rows('hms_op_visits?select=id',8,0);
for(const n of [5,6]){await rows('unified_patient_directory?select=user_id',n,3);await rows('hms_bills?select=id',n,3);}
for(const v of f.metadata.views.filter(v=>!['gamification_leaderboard','competition_college_leaderboard'].includes(v.name)))await denied(v.name+'?select=*');
await rows('gamification_leaderboard?select=user_id',null,0);
await rows('competition_college_leaderboard?select=college_name',null,1);
await denied('user_roles',1,{method:'POST',body:{user_id:id(1),role:'admin'}});
await denied('profiles?user_id=eq.'+id(1),1,{method:'PATCH',body:{hms_branch_id:id(103)}});
await denied('doctors?user_id=eq.'+id(4),4,{method:'PATCH',body:{hms_access:true,hms_modules:['all']}});
const search=await request('rpc/search_patient',1,{method:'POST',body:{_query:'Patient'}});
assert.equal(search.status,200);assert.equal(search.data.length,1);checks++;
await rows('mis_opd_summary?select=branch','service',3);
for(const v of f.metadata.views){const r=await request(v.name+'?select=*','service');assert.equal(r.status,200,v.name+': '+JSON.stringify(r.data));checks++;}
// Real local GoTrue principal, with the live FK cleanup semantics. No email is
// sent: the test account is created already confirmed through the local admin API.
const create=await fetch(api+'/auth/v1/admin/users',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+service,'Content-Type':'application/json'},body:JSON.stringify({email:`lifecycle-${randomUUID()}@example.invalid`,password:randomUUID(),email_confirm:true,user_metadata:{role:'admin'}})});
assert.equal(create.status,200,await create.clone().text());const actor=(await create.json()).id;
assert.match(actor,/^[0-9a-f-]{36}$/);checks++;
const record={doctor:randomUUID(),staff:randomUUID(),patient:randomUUID(),visit:randomUUID(),bridge:randomUUID()};
try{
 sql(`INSERT INTO public.doctors(id,user_id,full_name) VALUES('${record.doctor}','${actor}','Lifecycle synthetic doctor');
INSERT INTO public.hms_staff(id,user_id,name,role,branch_id,organisation_id) VALUES('${record.staff}','${actor}','Lifecycle synthetic staff','nurse','${id(101)}','${id(201)}');
INSERT INTO public.hms_op_patients(id,patient_id,auth_user_id,registered_by,first_name,mobile,branch) VALUES('${record.patient}','LOCAL-LIFECYCLE','${actor}','${actor}','Synthetic','local-only','Alpha');
INSERT INTO public.hms_op_visits(id,patient_id,patient_display_id,branch,assigned_by) VALUES('${record.visit}','${record.patient}','LOCAL-LIFECYCLE','Alpha','${actor}');
INSERT INTO public.ayuzee_hms_bridge(id,bridge_type,ayuzee_id,hms_id) VALUES('${record.bridge}','patient','${actor}','${record.patient}');`);
 const roles=await request('user_roles?select=role',actor);assert.equal(roles.status,200);assert.deepEqual(roles.data.map(r=>r.role),['patient']);checks++;
 const remove=await fetch(api+'/auth/v1/admin/users/'+actor,{method:'DELETE',headers:{apikey:key,Authorization:'Bearer '+service}});
 assert.ok([200,204].includes(remove.status),await remove.text());checks++;
 assert.equal(sql(`SELECT (SELECT user_id IS NULL FROM public.doctors WHERE id='${record.doctor}') AND (SELECT user_id IS NULL FROM public.hms_staff WHERE id='${record.staff}') AND (SELECT auth_user_id IS NULL AND registered_by IS NULL FROM public.hms_op_patients WHERE id='${record.patient}') AND (SELECT assigned_by IS NULL FROM public.hms_op_visits WHERE id='${record.visit}')`),'t');checks++;
 await rows('hms_op_patients?select=id',actor,0);
 await rows('user_roles?select=role',actor,0);
}finally{
 // Only this script's generated local records are removed; never reset a stack.
 sql(`DELETE FROM public.ayuzee_hms_bridge WHERE id='${record.bridge}'; DELETE FROM public.hms_op_visits WHERE id='${record.visit}'; DELETE FROM public.hms_op_patients WHERE id='${record.patient}'; DELETE FROM public.doctors WHERE id='${record.doctor}'; DELETE FROM public.hms_staff WHERE id='${record.staff}'; DELETE FROM auth.users WHERE id='${actor}';`);
}
const report={date:new Date().toISOString(),target:'loopback-only local Supabase PostgreSQL/Auth/PostgREST',checks,httpChecks:checks-1,relationalCleanupChecks:1,liveDataUsed:false,paidResourcesUsed:false,limitations:['Synthetic target schema; not a replay of all 429 live tables','Tokens signed using this disposable local stack only; hosted email delivery is a separate check']};
await writeFile(new URL('../docs/release/scoped-access-local-result.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(`Passed ${checks} local integration checks (${checks-1} HTTP and one FK cleanup assertion); no remote writes or paid resources.`);
