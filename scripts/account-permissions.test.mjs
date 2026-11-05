import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const a = '00000000-0000-0000-0000-000000000001';
const b = '00000000-0000-0000-0000-000000000002';
const c = '00000000-0000-0000-0000-000000000003';
test('account permission candidates on isolated PostgreSQL', { timeout: 60000 }, async t => {
  const db = new PGlite();
  const denied = body => assert.rejects(body, error => error.code === '42501');
  async function request(role, body, uid = a) {
    await db.exec(`SET SESSION AUTHORIZATION authenticator; SET ROLE ${role};`);
    try {
      await db.query("SELECT set_config('request.jwt.claim.role',$1,false),set_config('request.jwt.claim.sub',$2,false)", [role, uid]);
      return await body();
    } finally {
      await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE;');
      await db.exec("SELECT set_config('request.jwt.claim.role','',false),set_config('request.jwt.claim.sub','',false)");
    }
  }
  try {
    await db.exec(await read('../tests/database/fixtures/account-role-baseline.sql'));
    await db.exec(`
      CREATE TABLE auth.users(id uuid PRIMARY KEY, raw_user_meta_data jsonb DEFAULT '{}');
      INSERT INTO auth.users(id) VALUES ('${a}'),('${b}');
      ALTER TABLE public.user_roles ADD FOREIGN KEY(user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      CREATE TABLE public.profiles(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name text, phone text, email text, is_active boolean DEFAULT true, referral_code text,
        date_of_birth date, gender text, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      GRANT ALL ON public.profiles TO anon,authenticated,service_role;
      CREATE POLICY "Service role full access profiles" ON public.profiles FOR ALL USING(true);
      INSERT INTO public.profiles(user_id,full_name,phone,email) VALUES ('${a}','Synthetic A','private-a','a@example.invalid'),('${b}','Synthetic B','private-b','b@example.invalid');
      CREATE TABLE public.doctors(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE, full_name text, bio text,
        hms_access boolean DEFAULT false, is_approved boolean DEFAULT false, is_verified boolean DEFAULT false,
        hms_role text, hms_modules text[], hms_branches text[], vaidya_access boolean DEFAULT false, hms_access_expiry timestamptz,
        future_permission boolean DEFAULT false, updated_at timestamptz DEFAULT now());
      ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
      GRANT ALL ON public.doctors TO authenticated,service_role;
      CREATE POLICY doctor_own ON public.doctors TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
      INSERT INTO public.doctors(user_id,full_name,hms_access,hms_role,hms_modules) VALUES ('${a}','Synthetic Doctor',true,'branch_doctor',ARRAY['opd']);
      CREATE FUNCTION public.legacy_edit_profile(target uuid) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
        UPDATE public.profiles SET phone='changed' WHERE user_id=target;
      $$;
      CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
      BEGIN INSERT INTO public.profiles(user_id,full_name) VALUES(NEW.id,NEW.raw_user_meta_data->>'full_name'); RETURN NEW; END $$;
      CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      GRANT SELECT,INSERT,DELETE ON auth.users TO supabase_auth_admin;
      GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
    `);
    await t.test('negative controls reproduce profile exposure and doctor privilege edits', async () => {
      const profiles = await request('anon', () => db.query('SELECT phone FROM public.profiles'));
      assert.equal(profiles.rows.length, 2);
      await request('authenticated', () => db.exec("UPDATE public.doctors SET hms_role='owner',hms_modules=ARRAY['all']"));
      assert.equal((await db.query('SELECT hms_role FROM public.doctors')).rows[0].hms_role, 'owner');
      await db.exec("UPDATE public.doctors SET hms_role='branch_doctor',hms_modules=ARRAY['opd']");
    });
    for (const file of ['phase1-account-role-boundary.sql','phase1-profile-onboarding.sql','phase1-doctor-permissions.sql']) {
      await db.exec(await read('../supabase/review-candidates/' + file));
    }
    await t.test('private profiles are owner-readable and anonymous access is denied', async () => {
      await denied(() => request('anon', () => db.query('SELECT * FROM public.profiles')));
      for (const uid of [a,b]) {
        const result = await request('authenticated', () => db.query('SELECT user_id FROM public.profiles'), uid);
        assert.deepEqual(result.rows, [{ user_id: uid }]);
      }
    });
    await t.test('cross-account mutation cannot change a private profile', async () => {
      const result = await request('authenticated', () => db.query("UPDATE public.profiles SET phone='changed' WHERE user_id=$1 RETURNING user_id", [b]));
      assert.deepEqual(result.rows, []);
      assert.equal((await db.query('SELECT phone FROM public.profiles WHERE user_id=$1', [b])).rows[0].phone, 'private-b');
    });
    await t.test('private control columns and account identity cannot be self-edited', async () => {
      for (const sql of ["UPDATE public.profiles SET is_active=false", "UPDATE public.profiles SET user_id='"+c+"'", "UPDATE public.profiles SET referral_code='manufactured'"]) {
        await denied(() => request('authenticated', () => db.exec(sql)));
      }
    });
    await t.test('legacy owner-context RPCs cannot change another account profile',async()=>{
      await denied(()=>request('authenticated',()=>db.query('SELECT public.legacy_edit_profile($1)',[b])));
    });
    await t.test('onboarding persists atomically and can resume without any role grant', async () => {
      await request('authenticated', () => db.query('SELECT public.complete_account_onboarding($1,$2)', ['Updated Name','doctor']));
      const state = await request('authenticated', () => db.query('SELECT * FROM public.get_account_onboarding()'));
      assert.equal(state.rows[0].full_name, 'Updated Name');
      assert.equal(state.rows[0].requested_role, 'doctor');
      assert.ok(state.rows[0].completed_at);
      assert.equal((await db.query("SELECT count(*)::int AS n FROM public.user_roles WHERE user_id=$1 AND role='doctor'", [a])).rows[0].n, 0);
      await assert.rejects(() => request('authenticated', () => db.query('SELECT public.complete_account_onboarding($1,$2)', ['Wrong Name','admin'])), e => e.code==='22023');
      assert.equal((await db.query('SELECT full_name FROM public.profiles WHERE user_id=$1',[a])).rows[0].full_name,'Updated Name');
    });
    await t.test('onboarding cannot be written for another user', async () => {
      await denied(() => request('authenticated', () => db.query('INSERT INTO public.account_onboarding(user_id,requested_role) VALUES($1,$2)',[b,'doctor'])));
    });
    await t.test('a failure saving onboarding rolls back the accompanying profile update',async()=>{
      const before=(await db.query('SELECT full_name FROM public.profiles WHERE user_id=$1',[a])).rows[0].full_name;
      await db.exec("CREATE FUNCTION public.fixture_reject_onboarding() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$; CREATE TRIGGER fixture_reject BEFORE INSERT OR UPDATE ON public.account_onboarding FOR EACH ROW EXECUTE FUNCTION public.fixture_reject_onboarding();");
      await assert.rejects(()=>request('authenticated',()=>db.query('SELECT public.complete_account_onboarding($1,$2)',['Should Roll Back','patient'])),e=>e.code==='P0001');
      assert.equal((await db.query('SELECT full_name FROM public.profiles WHERE user_id=$1',[a])).rows[0].full_name,before);
      await db.exec('DROP TRIGGER fixture_reject ON public.account_onboarding; DROP FUNCTION public.fixture_reject_onboarding();');
    });
    await t.test('public cards expose only explicitly published presentation fields', async () => {
      assert.deepEqual((await request('anon',()=>db.query('SELECT * FROM public.account_public_cards'))).rows, []);
      await request('service_role',()=>db.query('INSERT INTO public.account_public_cards(user_id,display_name,published) VALUES($1,$2,true),($3,$4,false)',[a,'Public Name',b,'Unpublished Name']));
      const cards=await request('anon',()=>db.query('SELECT * FROM public.account_public_cards'));
      assert.equal(cards.rows.length,1);
      assert.deepEqual(Object.keys(cards.rows[0]).sort(),['avatar_url','display_name','published','user_id']);
      await denied(()=>request('authenticated',()=>db.exec("UPDATE public.account_public_cards SET published=true")));
    });
    await t.test('doctor owners may edit presentation, but not current or future privileges',async()=>{
      await request('authenticated',()=>db.exec("UPDATE public.doctors SET bio='Updated profile'"));
      const changes=["hms_role='owner'","hms_modules=ARRAY['all']","hms_branches=ARRAY['all']","vaidya_access=true","hms_access_expiry=now()+interval '10 years'","hms_access=false","is_approved=true","is_verified=true","future_permission=true","user_id='"+b+"'"];
      for(const change of changes) await denied(()=>request('authenticated',()=>db.exec('UPDATE public.doctors SET '+change)));
      assert.equal((await db.query('SELECT bio FROM public.doctors')).rows[0].bio,'Updated profile');
    });
    await t.test('professional requests cannot insert an approved doctor row',async()=>{
      await denied(()=>request('authenticated',()=>db.query('INSERT INTO public.doctors(user_id,full_name,is_approved) VALUES($1,$2,true)',[b,'Unapproved']),b));
    });
    await t.test('trusted backend administration still updates doctor permissions',async()=>{
      await request('service_role',()=>db.exec("UPDATE public.doctors SET hms_modules=ARRAY['opd','lab']"));
      assert.deepEqual((await db.query('SELECT hms_modules FROM public.doctors')).rows[0].hms_modules,['opd','lab']);
    });
    await t.test('Auth bootstrap ignores requested privileges and creates a private profile',async()=>{
      await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin;');
      try { await db.query('INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,$2)',[c,JSON.stringify({full_name:'New Account',role:'admin'})]); }
      finally { await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE;'); }
      assert.equal((await db.query('SELECT full_name FROM public.profiles WHERE user_id=$1',[c])).rows[0].full_name,'New Account');
      assert.deepEqual((await db.query('SELECT role FROM public.user_roles WHERE user_id=$1',[c])).rows,[{role:'patient'}]);
      await request('authenticated',()=>db.query('SELECT public.complete_account_onboarding($1,$2)',['New Account','patient']),c);
    });
    await t.test('trusted Auth account deletion can cascade through role assignments',async()=>{
      await request('service_role',()=>db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'patient') ON CONFLICT DO NOTHING",[c]));
      await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin;');
      try { await db.query('DELETE FROM auth.users WHERE id=$1',[c]); }
      finally { await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE;'); }
      assert.deepEqual((await db.query('SELECT * FROM public.user_roles WHERE user_id=$1',[c])).rows,[]);
    });
  } finally { await db.close(); }
});
