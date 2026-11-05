import { readFile } from 'node:fs/promises';
const read = p => readFile(new URL('../../'+p, import.meta.url), 'utf8');
export const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export async function scopedFixture({ nativeAuth=false }={}) {
  const metadata=JSON.parse(await read('local-staging/supabase/metadata/rbac-targets.json'));
  const registry=JSON.parse(await read('local-staging/supabase/metadata/patient-registry-columns.json'));
  const columns=[...metadata.columns,...registry];
  const tables=[...new Set(columns.map(c=>c.table))];
  const base=nativeAuth?'':`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS; CREATE ROLE authenticator NOLOGIN NOINHERIT;
CREATE ROLE supabase_auth_admin NOLOGIN; GRANT anon,authenticated,service_role TO authenticator;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.sub',true),''),NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role',true),''),NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'role') $$;
CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}',deleted_at timestamptz);`;
  let sql=base+`GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
CREATE TYPE public.app_role AS ENUM ('admin','doctor','patient','therapist','provider','super_admin','student','venue_owner','product_admin','blog_admin','content_admin','orders_admin','accounts_admin','doctor_admin','ayush_admin','support_admin','manufacturer');
CREATE SEQUENCE public.hms_op_visits_op_number_seq;`;
  for(const table of tables) {
    sql+=`CREATE TABLE public.${table} (${columns.filter(c=>c.table===table).map(c=>`"${c.name}" ${c.type}${c.default?' DEFAULT '+c.default:''}${c.not_null?' NOT NULL':''}`).join(',')});\n`;
    for(const con of metadata.constraints.filter(c=>c.table===table&&['p','u','c'].includes(c.type))) sql+=`ALTER TABLE public.${table} ADD CONSTRAINT ${con.name} ${con.definition};\n`;
    if(table==='hms_op_patients')sql+=`ALTER TABLE public.${table} ADD PRIMARY KEY(id);`;
    sql+=`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY; GRANT ALL ON public.${table} TO anon,authenticated,service_role;
CREATE POLICY fixture_unsafe_all ON public.${table} FOR ALL USING(true) WITH CHECK(true);\n`;
  }
  sql+='ALTER TABLE public.profiles ADD FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;';
  sql+='ALTER TABLE public.hms_op_patients ADD FOREIGN KEY(auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL, ADD FOREIGN KEY(registered_by) REFERENCES auth.users(id) ON DELETE SET NULL;';
  for(const con of metadata.constraints.filter(c=>c.type==='f'&&c.definition.includes('REFERENCES auth.users')&&c.table!=='profiles')){
    sql+=`ALTER TABLE public.${con.table} ADD CONSTRAINT ${con.name} ${con.definition};\n`;
  }
  const sources=['supabase/migrations/20260715_gamification_tables.sql','scripts/create_ayuzee_hms_bridge.sql','scripts/create_quiz_competitions_tables.sql','scripts/create_hms_mis_tables.sql','scripts/create_hrms_phase6_intelligence.sql','scripts/RUN_THIS_unified_patient_id.sql','scripts/create_hms_flags16_20.sql'];
  const viewSources=(await Promise.all(sources.map(read))).join('\n');
  for(const v of metadata.views){
    const re=new RegExp(`CREATE OR REPLACE VIEW (?:public\\.)?${v.name}\\s+AS[\\s\\S]*?;`,'i');
    const match=viewSources.match(re); if(!match)throw Error('Missing original view '+v.name);
    sql+=match[0]+`\nGRANT SELECT ON public.${v.name} TO anon,authenticated,service_role;\n`;
  }
  const u=n=>`'${id(n)}'`;
  sql+=`INSERT INTO auth.users(id,email) VALUES ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>`(${u(n)},'synthetic-${n}@example.invalid')`).join(',')};
INSERT INTO public.user_roles(user_id,role) VALUES (${u(1)},'patient'),(${u(2)},'patient'),(${u(3)},'patient'),(${u(4)},'doctor'),(${u(5)},'admin'),(${u(6)},'super_admin'),(${u(7)},'patient'),(${u(8)},'patient'),(${u(9)},'patient'),(${u(10)},'patient'),(${u(11)},'doctor_admin');
INSERT INTO public.hms_branches(id,branch_name,branch_code,organisation_id,is_active) VALUES (${u(101)},'Alpha','A',${u(201)},true),(${u(102)},'Beta','B',${u(201)},true),(${u(103)},'Gamma','C',${u(202)},true);
INSERT INTO public.profiles(user_id,full_name,email,phone,hms_branch_id) VALUES (${u(1)},'Patient Alpha','a@example.invalid','secret-a',${u(101)}),(${u(2)},'Patient Beta','b@example.invalid','secret-b',${u(102)}),(${u(3)},'Patient Gamma','c@example.invalid','secret-c',${u(103)});
INSERT INTO public.hms_op_patients(id,patient_id,auth_user_id,first_name,mobile,branch) VALUES (${u(301)},'P-A',${u(1)},'Patient Alpha','secret-a','Alpha'),(${u(302)},'P-B',${u(2)},'Patient Beta','secret-b','Beta'),(${u(303)},'P-C',${u(3)},'Patient Gamma','secret-c','Gamma');
INSERT INTO public.doctors(id,user_id,full_name,is_approved,hms_access,hms_modules,hms_branch) VALUES (${u(401)},${u(4)},'Assigned Doctor',true,true,ARRAY['opd'],'Alpha');
INSERT INTO public.hms_op_visits(id,patient_id,patient_display_id,doctor_id,branch) VALUES (${u(501)},${u(301)},'P-A',${u(401)},'Alpha'),(${u(502)},${u(302)},'P-B',${u(401)},'Beta'),(${u(503)},${u(303)},'P-C',${u(401)},'Gamma');
INSERT INTO public.hms_staff(id,user_id,name,role,branch_id,organisation_id,is_active) VALUES (${u(601)},${u(7)},'HR Alpha','hr',${u(101)},${u(201)},true),(${u(602)},${u(8)},'Finance Alpha','accountant',${u(101)},${u(201)},true),(${u(603)},${u(9)},'Reception Alpha','receptionist',${u(101)},${u(201)},true),(${u(604)},${u(10)},'Nurse Beta','nurse',${u(102)},${u(201)},true);
INSERT INTO public.hms_bills(patient_id,patient_name,bill_number,branch,visit_id,total_amount) VALUES (${u(301)},'Patient Alpha','B-A','Alpha',${u(501)},100),(${u(302)},'Patient Beta','B-B','Beta',${u(502)},200),(${u(303)},'Patient Gamma','B-C','Gamma',${u(503)},300);
INSERT INTO public.mis_daily_collection(collection_date,location,amount,bill_count) VALUES (CURRENT_DATE,'Alpha',100,1),(CURRENT_DATE,'Beta',200,1),(CURRENT_DATE,'Gamma',300,1);
INSERT INTO public.user_coins(user_id,role,total_points,total_coins) VALUES (${u(1)},'patient',10,900),(${u(2)},'patient',20,800);
INSERT INTO public.competition_scores(competition_id,user_id,college_name,score) VALUES (${u(701)},${u(1)},'Synthetic College',10),(${u(701)},${u(2)},'Synthetic College',20);
CREATE FUNCTION public.fixture_owner_profile(target uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ UPDATE public.profiles SET phone='stolen' WHERE user_id=target $$;
CREATE FUNCTION public.fixture_owner_role(target uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ INSERT INTO public.user_roles(user_id,role) VALUES(target,'admin') $$;
CREATE FUNCTION public.fixture_owner_scope() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$ UPDATE public.hms_staff SET role='admin' WHERE user_id=auth.uid() $$;
CREATE FUNCTION public.fixture_signup() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$ BEGIN INSERT INTO public.profiles(user_id,full_name) VALUES(NEW.id,'New signup'); INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'patient'); RETURN NEW; END $$;
CREATE TRIGGER fixture_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.fixture_signup();
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin; GRANT SELECT,INSERT,DELETE ON auth.users TO supabase_auth_admin;`;
  return {sql,metadata,tables};
}

export async function localRepair(db,metadata,path='supabase/review-candidates/phase0-2-scoped-access.sql') {
  let sql=await read(path);
  // Only the drift precondition changes for synthetic local views. The repair,
  // policies, functions and privileges remain byte-for-byte the live candidate.
  for(const v of metadata.views){
    const {rows}=await db.query('SELECT md5(pg_get_viewdef($1::regclass,true)) AS hash',['public.'+v.name]);
    sql=sql.replace(v.fingerprint,rows[0].hash);
  }
  return sql;
}
