import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {scopedFixture,localRepair,id} from '../tests/database/scoped-fixture.mjs';
test('scoped access repair on synthetic PostgreSQL', {timeout:60000},async t=>{
 const db=new PGlite();
 const denied=fn=>assert.rejects(fn,e=>e.code==='42501');
 async function request(n,sql,role='authenticated'){
  let nested=false;
  try{await db.exec('SAVEPOINT request_boundary');nested=true;}catch(e){if(e.code!=='25P01')throw e;}
  await db.exec(`SET SESSION AUTHORIZATION authenticator; SET ROLE ${role};`);
  try{
   await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[n?id(n):'',role]);
   return (await db.query(sql)).rows;
  }catch(e){if(nested)await db.exec('ROLLBACK TO SAVEPOINT request_boundary');throw e;}
  finally{await db.exec("SET SESSION AUTHORIZATION postgres; RESET ROLE; SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");if(nested)await db.exec('RELEASE SAVEPOINT request_boundary');}
 }
 const rows=(n,table,role)=>request(n,`SELECT * FROM public.${table}`,role);
 try{
  const f=await scopedFixture(); await db.exec(f.sql);
  await t.test('negative control reproduces anonymous private exposure',async()=>{
   assert.equal((await rows(null,'unified_patient_directory','anon')).length,3);
   assert.equal((await rows(1,'profiles')).length,3);
  });
  const candidate=await localRepair(db,f.metadata,'supabase/migrations/20261103193309_phase0_2_scoped_access.sql'); await db.exec(candidate);
  await t.test('forward Auth lifecycle migration upgrades the exact applied repair',async()=>{
   await db.exec(await readFile(new URL('../supabase/review-candidates/phase1-auth-lifecycle.sql',import.meta.url),'utf8'));
  });
  await t.test('all 21 view column contracts survive unchanged',async()=>{
   for(const v of f.metadata.views){
    const {rows}=await db.query("SELECT a.attname AS name,format_type(a.atttypid,a.atttypmod) AS type FROM pg_attribute a WHERE a.attrelid=$1::regclass AND a.attnum>0 AND NOT a.attisdropped ORDER BY a.attnum",['public.'+v.name]);
    assert.deepEqual(rows,v.columns,v.name);
   }
  });
  await t.test('anonymous callers cannot read 19 private reports or raw Auth',async()=>{
   for(const v of f.metadata.views.filter(v=>!['gamification_leaderboard','competition_college_leaderboard'].includes(v.name)))await denied(()=>rows(null,v.name,'anon'));
   await denied(()=>request(null,'SELECT * FROM auth.users','anon'));
   await denied(()=>rows(null,'profiles','anon'));
  });
  await t.test('patients read only their own profiles, registry, visits and bills',async()=>{
   for(const n of [1,2,3]){
    assert.deepEqual((await rows(n,'profiles')).map(r=>r.user_id),[id(n)]);
    assert.deepEqual((await rows(n,'unified_patient_directory')).map(r=>r.user_id),[id(n)]);
    assert.deepEqual((await rows(n,'unified_patient_view')).map(r=>r.user_id),[id(n)]);
    assert.equal((await rows(n,'hms_op_patients')).length,1);
    assert.equal((await rows(n,'hms_op_visits')).length,1);
    assert.equal((await rows(n,'hms_bills')).length,1);
    assert.equal((await rows(n,'hms_staff')).length,0);
   }
  });
  await t.test('doctor sees assigned patients in granted branch only',async()=>{
   assert.deepEqual((await rows(4,'profiles')).map(r=>r.user_id),[id(1)]);
   assert.deepEqual((await rows(4,'hms_op_visits')).map(r=>r.id),[id(501)]);
   assert.equal((await rows(4,'hms_op_patients')).length,1);
   for(const change of ["is_suspended=true","is_approved=false","hms_access_expiry=now()-interval '1 day'","hms_modules=ARRAY['billing']"]){
    await db.exec('BEGIN; UPDATE public.doctors SET '+change);
    assert.equal((await rows(4,'hms_op_visits')).length,0,change);
    await db.exec('ROLLBACK');
   }
  });
  await t.test('staff access is domain, branch and organization scoped',async()=>{
   assert.equal((await rows(7,'hms_staff')).length,3);
   assert.equal((await rows(7,'profiles')).length,0);
   assert.equal((await rows(7,'hms_bills')).length,0);
   assert.equal((await rows(8,'hms_bills')).length,1);
   assert.equal((await rows(8,'hms_op_visits')).length,0);
   assert.equal((await rows(8,'mis_opd_summary')).length,1);
   assert.equal((await rows(9,'profiles')).length,1);
   assert.equal((await rows(9,'hms_op_patients')).length,1);
   assert.equal((await rows(10,'profiles')).length,0);
   await db.exec(`BEGIN; UPDATE public.hms_staff SET organisation_id='${id(202)}' WHERE user_id='${id(8)}'`);
   assert.equal((await rows(8,'hms_bills')).length,0); await db.exec('ROLLBACK');
  });
  await t.test('existing admin and super admin retain authorized reads on every view',async()=>{
   for(const n of [5,6]){
    assert.equal((await rows(n,'profiles')).length,3);
    assert.equal((await rows(n,'hms_op_patients')).length,3);
    assert.equal((await rows(n,'hms_bills')).length,3);
    for(const v of f.metadata.views)await rows(n,v.name);
   }
  });
  await t.test('trusted service reads retain all reports without a user identity',async()=>{
   for(const v of f.metadata.views)await rows(null,v.name,'service_role');
   assert.equal((await rows(null,'mis_opd_summary','service_role')).length,3);
   assert.ok((await rows(null,'unified_patient_directory','service_role')).every(p=>p.linked_branch));
  });
  await t.test('public leaderboards exclude private balances and require publication choice',async()=>{
   assert.equal((await rows(null,'gamification_leaderboard','anon')).length,0);
   assert.equal((await rows(1,'gamification_leaderboard'))[0].total_coins,900);
   await request(1,'SELECT public.set_leaderboard_visibility(true)');
   const visible=await rows(null,'gamification_leaderboard','anon');
   assert.equal(visible.length,1); assert.equal(visible[0].user_id,id(1)); assert.equal(visible[0].total_coins,null);
   assert.equal((await rows(2,'user_coins')).length,1);
   const colleges=await rows(null,'competition_college_leaderboard','anon');
   assert.equal(colleges[0].participants,2); assert.equal(colleges[0].total_score,30);
   await denied(()=>request(null,'SELECT public.set_leaderboard_visibility(true)','anon'));
   await request(1,'SELECT public.set_leaderboard_visibility(false)');
   assert.equal((await rows(null,'gamification_leaderboard','anon')).length,0);
  });
  await t.test('profile search observes exactly the same patient scope',async()=>{
   for(const n of [1,4,9])assert.deepEqual((await request(n,"SELECT * FROM public.search_patient('Patient')")).map(r=>r.full_name),['Patient Alpha']);
   assert.equal((await request(5,"SELECT * FROM public.search_patient('Patient')")).length,3);
   await denied(()=>request(null,"SELECT * FROM public.search_patient('Patient')",'anon'));
  });
  await t.test('self promotion, clinical relinking and owner-context bypasses are denied',async()=>{
   for(const sql of [`INSERT INTO public.user_roles(user_id,role) VALUES('${id(1)}','admin')`,`SELECT public.fixture_owner_role('${id(1)}')`,`SELECT public.fixture_owner_profile('${id(2)}')`,`UPDATE public.profiles SET hms_branch_id='${id(103)}'`,`UPDATE public.profiles SET user_id='${id(12)}'`])await denied(()=>request(1,sql));
   await denied(()=>request(7,'SELECT public.fixture_owner_scope()'));
   for(const sql of ["UPDATE public.doctors SET is_approved=false","UPDATE public.doctors SET hms_branch='Gamma'","UPDATE public.doctors SET hms_modules=ARRAY['all']","UPDATE public.hms_op_visits SET branch='Gamma'"])await denied(()=>request(4,sql));
   await request(4,"UPDATE public.doctors SET bio='Allowed presentation edit'");
   await request(1,"UPDATE public.profiles SET full_name='Patient Alpha'");
   assert.deepEqual((await request(1,`UPDATE public.profiles SET full_name='Stolen' WHERE user_id='${id(2)}' RETURNING user_id`)),[]);
   assert.deepEqual(await request(1,'UPDATE public.user_coins SET total_coins=999999 RETURNING id'),[]);
   await denied(()=>request(9,`UPDATE public.hms_op_patients SET auth_user_id='${id(9)}' WHERE id='${id(301)}'`));
  });
  await t.test('role removal takes effect without refreshing token metadata',async()=>{
   await db.exec(`BEGIN; DELETE FROM public.user_roles WHERE user_id='${id(4)}'`);
   assert.equal((await rows(4,'hms_op_visits')).length,0);await db.exec('ROLLBACK');
   await db.exec(`BEGIN; DELETE FROM public.user_roles WHERE user_id='${id(5)}'`);
   assert.equal((await rows(5,'profiles')).length,0);await db.exec('ROLLBACK');
  });
  await t.test('trusted Auth signup can create baseline profile and patient role',async()=>{
   await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin');
   try{await db.query('INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES($1,$2,$3)',[id(20),'signup@example.invalid',{role:'admin'}]);}
   finally{await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE');}
   assert.deepEqual((await db.query('SELECT role FROM public.user_roles WHERE user_id=$1',[id(20)])).rows,[{role:'patient'}]);
   assert.equal((await rows(20,'profiles')).length,1);
  });
  await t.test('data and existing role assignments survive migration',async()=>{
   assert.equal((await db.query('SELECT count(*)::int AS n FROM public.profiles')).rows[0].n,4);
   assert.equal((await db.query('SELECT count(*)::int AS n FROM public.user_roles')).rows[0].n,12);
  });
  await t.test('Auth deletion preserves doctor/staff records while nulling their account links',async()=>{
   await db.exec(`INSERT INTO public.doctors(user_id,full_name) VALUES('${id(20)}','Deletable synthetic doctor');
    INSERT INTO public.hms_staff(user_id,name,role,branch_id,organisation_id) VALUES('${id(20)}','Deletable synthetic staff','nurse','${id(101)}','${id(201)}');
    UPDATE public.hms_op_visits SET assigned_by='${id(20)}' WHERE id='${id(501)}';
    INSERT INTO public.hms_op_patients(id,patient_id,first_name,mobile,branch,auth_user_id,registered_by) VALUES('${id(320)}','P-DELETE','Synthetic','local-only','Alpha','${id(20)}','${id(20)}');
    INSERT INTO public.ayuzee_hms_bridge(bridge_type,ayuzee_id,hms_id) VALUES('patient','${id(20)}','${id(320)}');
    SET SESSION AUTHORIZATION supabase_auth_admin;`);
   try{await db.query('DELETE FROM auth.users WHERE id=$1',[id(20)]);}
   finally{await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE');}
   assert.deepEqual((await db.query('SELECT user_id FROM public.doctors WHERE full_name=$1',['Deletable synthetic doctor'])).rows,[{user_id:null}]);
   assert.deepEqual((await db.query('SELECT user_id FROM public.hms_staff WHERE name=$1',['Deletable synthetic staff'])).rows,[{user_id:null}]);
   assert.deepEqual((await db.query('SELECT assigned_by FROM public.hms_op_visits WHERE id=$1',[id(501)])).rows,[{assigned_by:null}]);
   assert.deepEqual((await db.query('SELECT auth_user_id,registered_by FROM public.hms_op_patients WHERE id=$1',[id(320)])).rows,[{auth_user_id:null,registered_by:null}]);
   assert.equal((await rows(20,'hms_op_patients')).length,0,'Old account token must not regain orphan bridge access');
  });
  await t.test('soft-deleted accounts lose private reads even while an old token exists',async()=>{
   for(const n of [2,4,5]){
    await db.exec(`BEGIN; UPDATE auth.users SET deleted_at=now() WHERE id='${id(n)}'`);
    for(const table of ['profiles','user_roles','hms_op_patients','hms_op_visits','user_coins'])assert.equal((await rows(n,table)).length,0,`${n}: ${table}`);
    await denied(()=>request(n,'SELECT public.set_leaderboard_visibility(true)'));
    await db.exec('ROLLBACK');
   }
  });
  await t.test('changed view fingerprint aborts before changing permissions',async()=>{
   await assert.rejects(()=>db.exec(candidate),/changed since inspection/);
   await db.exec('ROLLBACK');
   assert.equal((await rows(1,'profiles')).length,1);
  });
 }finally{await db.close();}
});
