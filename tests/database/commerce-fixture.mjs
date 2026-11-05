import {readFile} from 'node:fs/promises';
import {scopedFixture,localRepair} from './scoped-fixture.mjs';
const read=p=>readFile(new URL('../../'+p,import.meta.url),'utf8');
export async function commerceTablesSQL(){
 const meta=JSON.parse(await read('tests/database/commerce-metadata.json'));const quote=s=>'"'+s.replaceAll('"','""')+'"';let sql='';
 for(const table of ['products','orders']){
  const cols=meta.columns.filter(c=>c.table===table).map(c=>`${quote(c.name)} ${c.udt.startsWith('_')?c.udt.slice(1)+'[]':c.udt}${c.default?' DEFAULT '+c.default:''}${c.nullable==='NO'?' NOT NULL':''}`);
  sql+=`CREATE TABLE public.${table}(${cols.join(',')});ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;GRANT ALL ON public.${table} TO anon,authenticated,service_role;\n`;
  for(const c of meta.constraints.filter(c=>c.table===table))sql+=`ALTER TABLE public.${table} ADD CONSTRAINT ${quote(c.name)} ${c.definition};\n`;
  for(const p of meta.policies.filter(p=>p.table===table))sql+=`CREATE POLICY ${quote(p.name)} ON public.${table} FOR ${p.command} TO ${p.roles.join(',')}${p.using?' USING('+p.using+')':''}${p.check?' WITH CHECK('+p.check+')':''};\n`;
 }
 return sql;
}
export async function checkoutFixture(db){
 const f=await scopedFixture();await db.exec(f.sql);await db.exec(await localRepair(db,f.metadata,'supabase/migrations/20261103193309_phase0_2_scoped_access.sql'));
 await db.exec(await read('supabase/migrations/20261103195736_auth_lifecycle_permissions.sql'));
 await db.exec('DROP TRIGGER fixture_signup ON auth.users; DROP FUNCTION public.fixture_signup()');
 await db.exec(await read('supabase/migrations/20261104040057_account_onboarding_contract.sql'));
 await db.exec(await commerceTablesSQL());await db.exec(await read('supabase/review-candidates/phase3-catalog.sql'));
 await db.exec("ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz DEFAULT now();CREATE TABLE auth.sessions(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,not_after timestamptz);INSERT INTO auth.sessions(id,user_id) SELECT ('10000000-0000-4000-8000-'||right(id::text,12))::uuid,id FROM auth.users");
 await db.exec(await read('supabase/review-candidates/phase3-checkout.sql'));
}
