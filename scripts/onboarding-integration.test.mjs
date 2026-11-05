import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {scopedFixture,localRepair,id} from '../tests/database/scoped-fixture.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('onboarding integrates with the exact deployed access migrations',async t=>{
 const db=new PGlite();
 const denied=fn=>assert.rejects(fn,e=>e.code==='42501');
 async function request(n,fn,role='authenticated'){
  await db.exec(`SET SESSION AUTHORIZATION authenticator; SET ROLE ${role}`);
  try{await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[n?id(n):'',role]);return await fn();}
  finally{await db.exec("SET SESSION AUTHORIZATION postgres; RESET ROLE; SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");}
 }
 const get=n=>request(n,()=>db.query('SELECT * FROM public.get_account_onboarding()'));
 const complete=(n,name,role)=>request(n,()=>db.query('SELECT public.complete_account_onboarding($1,$2)',[name,role]));
 try{
  const f=await scopedFixture();await db.exec(f.sql);
  await db.exec(await localRepair(db,f.metadata,'supabase/migrations/20261103193309_phase0_2_scoped_access.sql'));
  await db.exec(await read('supabase/migrations/20261103195736_auth_lifecycle_permissions.sql'));
  await db.exec('DROP TRIGGER fixture_signup ON auth.users; DROP FUNCTION public.fixture_signup()');
  const before=(await db.query('SELECT user_id,role FROM public.user_roles ORDER BY user_id,role')).rows;
  const candidate=await read('supabase/review-candidates/phase1-onboarding-integration.sql');await db.exec(candidate);
  await t.test('installation preserves existing profile/role assignments and admin access',async()=>{
   assert.deepEqual((await db.query('SELECT user_id,role FROM public.user_roles ORDER BY user_id,role')).rows,before);
   assert.equal((await request(5,()=>db.query('SELECT * FROM public.profiles'))).rows.length,3);
  });
  await t.test('existing accounts accurately report unfinished onboarding',async()=>{
   const r=(await get(1)).rows;assert.equal(r.length,1);assert.equal(r[0].full_name,'Patient Alpha');assert.equal(r[0].completed_at,null);
  });
  await t.test('onboarding persists/resumes without granting a requested role',async()=>{
   await complete(1,'  Patient Updated  ','doctor');const r=(await get(1)).rows[0];
   assert.equal(r.full_name,'Patient Updated');assert.equal(r.requested_role,'doctor');assert.ok(r.completed_at);
   assert.deepEqual((await request(1,()=>db.query('SELECT role FROM public.user_roles'))).rows,[{role:'patient'}]);
   await complete(1,'Patient Updated','student');assert.equal((await get(1)).rows[0].requested_role,'student');
  });
  await t.test('anonymous and cross-account onboarding are denied',async()=>{
   await denied(()=>request(null,()=>db.query('SELECT * FROM public.get_account_onboarding()'),'anon'));
   await denied(()=>request(null,()=>db.query("SELECT public.complete_account_onboarding('Someone','patient')"),'anon'));
   await denied(()=>request(2,()=>db.query('INSERT INTO public.account_onboarding(user_id,requested_role) VALUES($1,$2)',[id(1),'patient'])));
   assert.deepEqual((await request(2,()=>db.query('SELECT * FROM public.account_onboarding'))).rows,[]);
   const r=(await get(5)).rows;assert.deepEqual(r,[],'Admin onboarding endpoint must not return other users');
  });
  await t.test('invalid names/privileged role requests leave both records unchanged',async()=>{
   for(const [name,role] of [['x','patient'],['x'.repeat(101),'patient'],['Changed','admin'],['Changed','super_admin'],['Changed',null]]){
    await assert.rejects(()=>complete(1,name,role),e=>e.code==='22023');
    assert.equal((await get(1)).rows[0].full_name,'Patient Updated');
    assert.equal((await get(1)).rows[0].requested_role,'student');
   }
  });
  await t.test('a failed persistence step rolls back the profile update',async()=>{
   await db.exec("CREATE FUNCTION public.fixture_fail_onboarding() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic persistence failure'; END $$; CREATE TRIGGER fixture_fail_onboarding BEFORE INSERT OR UPDATE ON public.account_onboarding FOR EACH ROW EXECUTE FUNCTION public.fixture_fail_onboarding()");
   await assert.rejects(()=>complete(1,'Must Roll Back','doctor'),/Synthetic persistence failure/);
   assert.equal((await get(1)).rows[0].full_name,'Patient Updated');
   await db.exec('DROP TRIGGER fixture_fail_onboarding ON public.account_onboarding; DROP FUNCTION public.fixture_fail_onboarding()');
  });
  await t.test('real Auth principal provisions only baseline patient/profile from signup',async()=>{
   await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin');
   try{await db.query('INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES($1,$2,$3)',[id(50),'new@example.invalid',{full_name:'New synthetic person',role:'super_admin',hms_branch_id:id(103)}]);}
   finally{await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE');}
   assert.deepEqual((await request(50,()=>db.query('SELECT role FROM public.user_roles'))).rows,[{role:'patient'}]);
   assert.equal((await get(50)).rows[0].full_name,'New synthetic person');
   assert.equal((await db.query('SELECT hms_branch_id FROM public.profiles WHERE user_id=$1',[id(50)])).rows[0].hms_branch_id,null);
   await complete(50,'New synthetic person','doctor');
  });
  await t.test('onboarding cannot alter protected clinical links',async()=>{
   await denied(()=>request(1,()=>db.query('UPDATE public.profiles SET hms_branch_id=$1 WHERE user_id=$2',[id(103),id(1)])));
   assert.equal((await request(4,()=>db.query('SELECT * FROM public.hms_op_visits'))).rows.length,1);
  });
  await t.test('Auth deletion cascades onboarding and stale identity cannot read it',async()=>{
   await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin');
   try{await db.query('DELETE FROM auth.users WHERE id=$1',[id(50)]);}finally{await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE');}
   assert.deepEqual((await get(50)).rows,[]);
   assert.equal((await db.query('SELECT count(*)::int AS n FROM public.account_onboarding WHERE user_id=$1',[id(50)])).rows[0].n,0);
  });
 }finally{await db.close();}
});
