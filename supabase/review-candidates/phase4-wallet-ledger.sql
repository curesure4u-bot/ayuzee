-- Phase 4.1 LOCAL review candidate. Requires the applied account/RBAC foundation.
-- Fictional event source only. No legacy balance import, payout or provider call.
BEGIN;
CREATE SCHEMA ayuzee_finance;
REVOKE ALL ON SCHEMA ayuzee_finance FROM PUBLIC;
GRANT USAGE ON SCHEMA ayuzee_finance TO authenticated,service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ayuzee_finance REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
CREATE TABLE ayuzee_finance.policy(singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),enabled boolean NOT NULL DEFAULT false);
INSERT INTO ayuzee_finance.policy DEFAULT VALUES;
CREATE TABLE ayuzee_finance.accounts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 kind text NOT NULL CHECK(kind IN('customer','clearing')),unit text NOT NULL CHECK(unit IN('INR_PAISE','COIN')),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(kind<>'clearing' OR owner_id IS NULL)
);
CREATE UNIQUE INDEX finance_owner_unit ON ayuzee_finance.accounts(owner_id,unit) WHERE kind='customer';
CREATE UNIQUE INDEX finance_clearing_unit ON ayuzee_finance.accounts(unit) WHERE kind='clearing';
INSERT INTO ayuzee_finance.accounts(kind,unit) VALUES('clearing','INR_PAISE'),('clearing','COIN');
CREATE TABLE ayuzee_finance.events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),account_id uuid NOT NULL REFERENCES ayuzee_finance.accounts(id),
 integration text NOT NULL CHECK(integration ~ '^fixture_[A-Za-z0-9_]{3,60}$'),reference uuid NOT NULL,
 amount bigint NOT NULL CHECK(amount<>0 AND amount BETWEEN -1000000000 AND 1000000000),
 purpose text NOT NULL CHECK(purpose IN('fixture_credit','fixture_debit')),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(integration,reference),CHECK((purpose='fixture_credit' AND amount>0) OR(purpose='fixture_debit' AND amount<0))
);
CREATE TABLE ayuzee_finance.journals(event_id uuid PRIMARY KEY REFERENCES ayuzee_finance.events(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp());
CREATE TABLE ayuzee_finance.entries(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),event_id uuid NOT NULL REFERENCES ayuzee_finance.journals(event_id),account_id uuid NOT NULL REFERENCES ayuzee_finance.accounts(id),
 amount bigint NOT NULL CHECK(amount<>0 AND amount BETWEEN -1000000000 AND 1000000000),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(event_id,account_id)
);
CREATE INDEX finance_account_history ON ayuzee_finance.entries(account_id,created_at DESC,id DESC);
CREATE FUNCTION ayuzee_finance.immutable_entry() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 -- Owner maintenance is distinct from public/service RPC authority. No purge API.
 IF session_user IN('postgres','supabase_admin') AND current_user IN('postgres','supabase_admin') THEN RETURN OLD;END IF;
 RAISE EXCEPTION 'Ledger history is append only' USING ERRCODE='42501';
END $$;
CREATE TRIGGER finance_entries_immutable BEFORE UPDATE OR DELETE ON ayuzee_finance.entries FOR EACH ROW EXECUTE FUNCTION ayuzee_finance.immutable_entry();
CREATE TRIGGER finance_events_immutable BEFORE UPDATE OR DELETE ON ayuzee_finance.events FOR EACH ROW EXECUTE FUNCTION ayuzee_finance.immutable_entry();
CREATE TRIGGER finance_journals_immutable BEFORE UPDATE OR DELETE ON ayuzee_finance.journals FOR EACH ROW EXECUTE FUNCTION ayuzee_finance.immutable_entry();
-- Deferred checks run after the API returns: this private checker needs owner reads, not caller table access.
CREATE FUNCTION ayuzee_finance.check_journal() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e ayuzee_finance.events;n integer;v_sum numeric;units integer;customer_amount bigint;
BEGIN
 SELECT * INTO e FROM ayuzee_finance.events WHERE id=NEW.event_id;
 SELECT count(*),sum(x.amount),count(DISTINCT a.unit),sum(x.amount) FILTER(WHERE x.account_id=e.account_id) INTO n,v_sum,units,customer_amount
 FROM ayuzee_finance.entries x JOIN ayuzee_finance.accounts a ON a.id=x.account_id WHERE x.event_id=NEW.event_id;
 IF n<>2 OR v_sum<>0 OR units<>1 OR customer_amount IS DISTINCT FROM e.amount OR NOT EXISTS(SELECT 1 FROM ayuzee_finance.entries x JOIN ayuzee_finance.accounts a ON a.id=x.account_id WHERE x.event_id=e.id AND a.kind='clearing') THEN RAISE EXCEPTION 'Unbalanced journal' USING ERRCODE='23514';END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER finance_journal_balanced AFTER INSERT ON ayuzee_finance.journals DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION ayuzee_finance.check_journal();
CREATE CONSTRAINT TRIGGER finance_entries_balanced AFTER INSERT ON ayuzee_finance.entries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION ayuzee_finance.check_journal();
DO $$DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['policy','accounts','events','journals','entries'] LOOP
 EXECUTE format('ALTER TABLE ayuzee_finance.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('REVOKE ALL ON ayuzee_finance.%I FROM PUBLIC,anon,authenticated,service_role',t);
END LOOP;END $$;
CREATE FUNCTION ayuzee_finance.live_actor(p_workspace text) RETURNS boolean LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path='' AS $$
 SELECT ayuzee_private.rbac_actor() AND EXISTS(SELECT 1 FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id JOIN public.user_roles r ON r.user_id=u.id
 WHERE u.id=auth.uid() AND u.email_confirmed_at IS NOT NULL AND s.id=NULLIF(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id','')::uuid
 AND(s.not_after IS NULL OR s.not_after>clock_timestamp()) AND r.role::text=p_workspace)
$$;
CREATE FUNCTION ayuzee_finance.wallet_read(p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' AS $$
DECLARE a ayuzee_finance.accounts;v_page integer;result jsonb;v_balance numeric;
BEGIN
 IF NOT ayuzee_finance.live_actor(p_payload->>'workspace') THEN RAISE EXCEPTION 'Wallet access denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR p_payload-ARRAY['workspace','unit','page']<>'{}'::jsonb OR pg_column_size(p_payload)>1000 OR(p_payload->>'unit' IN('INR_PAISE','COIN')) IS NOT TRUE THEN RAISE EXCEPTION 'Invalid wallet request' USING ERRCODE='22023';END IF;
 v_page:=COALESCE((p_payload->>'page')::integer,1);IF v_page NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid wallet page' USING ERRCODE='22023';END IF;
 SELECT * INTO a FROM ayuzee_finance.accounts WHERE owner_id=auth.uid() AND kind='customer' AND unit=p_payload->>'unit';
 IF NOT FOUND THEN RETURN jsonb_build_object('unit',p_payload->>'unit','initialized',false,'balance',NULL,'entries','[]'::jsonb,'hasMore',false);END IF;
 SELECT COALESCE(sum(amount),0) INTO v_balance FROM ayuzee_finance.entries WHERE account_id=a.id;
 WITH selected AS(SELECT x.id,x.amount,x.created_at,e.purpose FROM ayuzee_finance.entries x JOIN ayuzee_finance.events e ON e.id=x.event_id WHERE x.account_id=a.id ORDER BY x.created_at DESC,x.id DESC OFFSET(v_page-1)*20 LIMIT 21),numbered AS(SELECT *,row_number()OVER(ORDER BY created_at DESC,id DESC)rn FROM selected)
 SELECT jsonb_build_object('unit',a.unit,'initialized',true,'balance',v_balance::text,'entries',COALESCE(jsonb_agg(jsonb_build_object('id',id,'amount',amount::text,'purpose',purpose,'created_at',created_at) ORDER BY rn) FILTER(WHERE rn<=20),'[]'::jsonb),'hasMore',count(*)>20) INTO result FROM numbered;
 RETURN result;
END $$;
CREATE FUNCTION public.wallet_ledger_status(p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_finance.wallet_read(p_payload)$$;
CREATE FUNCTION ayuzee_finance.wallet_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE a ayuzee_finance.accounts;c ayuzee_finance.accounts;e ayuzee_finance.events;existing ayuzee_finance.events;v_amount bigint;v_balance numeric;v_owner uuid;
BEGIN
 IF NOT ayuzee_private.rbac_server() THEN RAISE EXCEPTION 'Wallet worker denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>2000 THEN RAISE EXCEPTION 'Invalid wallet event' USING ERRCODE='22023';END IF;
 IF p_action='register' THEN
  IF p_payload-ARRAY['user_id','unit','integration','reference','amount','purpose']<>'{}'::jsonb OR(p_payload->>'integration'~'^fixture_[A-Za-z0-9_]{3,60}$') IS NOT TRUE OR(p_payload->>'unit' IN('INR_PAISE','COIN')) IS NOT TRUE OR jsonb_typeof(p_payload->'amount') IS DISTINCT FROM 'number' OR COALESCE(p_payload->>'amount','')!~'^-?[1-9][0-9]{0,9}$' THEN RAISE EXCEPTION 'Invalid event fields' USING ERRCODE='22023';END IF;
  v_amount:=(p_payload->>'amount')::bigint;v_owner:=(p_payload->>'user_id')::uuid;
  IF abs(v_amount)>1000000000 OR (p_payload->>'purpose'=CASE WHEN v_amount>0 THEN 'fixture_credit' ELSE 'fixture_debit' END) IS NOT TRUE OR p_payload->>'reference' IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=v_owner AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Invalid event authority' USING ERRCODE='22023';END IF;
  -- Serialize both event identity and account creation without trusting browser keys.
  PERFORM pg_advisory_xact_lock(hashtextextended('wallet-event:'||(p_payload->>'integration')||':'||(p_payload->>'reference'),0));
  INSERT INTO ayuzee_finance.accounts(owner_id,kind,unit) VALUES(v_owner,'customer',p_payload->>'unit') ON CONFLICT(owner_id,unit) WHERE kind='customer' DO NOTHING;
  SELECT * INTO a FROM ayuzee_finance.accounts WHERE owner_id=v_owner AND kind='customer' AND unit=p_payload->>'unit';
  SELECT * INTO existing FROM ayuzee_finance.events WHERE integration=p_payload->>'integration' AND reference=(p_payload->>'reference')::uuid;
  IF FOUND THEN
   IF existing.account_id<>a.id OR existing.amount<>v_amount OR existing.purpose IS DISTINCT FROM p_payload->>'purpose' THEN RAISE EXCEPTION 'Wallet event replay changed' USING ERRCODE='P5502';END IF;RETURN jsonb_build_object('event_id',existing.id);
  END IF;
  IF NOT(SELECT enabled FROM ayuzee_finance.policy WHERE singleton FOR SHARE) THEN RAISE EXCEPTION 'Wallet events disabled' USING ERRCODE='P5500';END IF;
  INSERT INTO ayuzee_finance.events(account_id,integration,reference,amount,purpose) VALUES(a.id,p_payload->>'integration',(p_payload->>'reference')::uuid,v_amount,p_payload->>'purpose') RETURNING * INTO e;
  RETURN jsonb_build_object('event_id',e.id);
 ELSIF p_action='post' THEN
  IF p_payload-ARRAY['event_id']<>'{}'::jsonb OR p_payload->>'event_id' IS NULL THEN RAISE EXCEPTION 'Invalid journal request' USING ERRCODE='22023';END IF;
  SELECT * INTO e FROM ayuzee_finance.events WHERE id=(p_payload->>'event_id')::uuid;
  IF NOT FOUND THEN RAISE EXCEPTION 'Verified event unavailable' USING ERRCODE='42501';END IF;
  SELECT * INTO a FROM ayuzee_finance.accounts WHERE id=e.account_id;
  SELECT * INTO c FROM ayuzee_finance.accounts WHERE kind='clearing' AND unit=a.unit;
  PERFORM id FROM ayuzee_finance.accounts WHERE id IN(a.id,c.id) ORDER BY id FOR UPDATE;
  IF EXISTS(SELECT 1 FROM ayuzee_finance.journals WHERE event_id=e.id) THEN RETURN jsonb_build_object('event_id',e.id,'posted',true);END IF;
  IF NOT(SELECT enabled FROM ayuzee_finance.policy WHERE singleton FOR SHARE) THEN RAISE EXCEPTION 'Wallet posting disabled' USING ERRCODE='P5500';END IF;
  IF NOT EXISTS(SELECT 1 FROM ayuzee_finance.accounts x JOIN auth.users u ON u.id=x.owner_id WHERE x.id=a.id AND u.deleted_at IS NULL) THEN RAISE EXCEPTION 'Wallet owner unavailable; review required' USING ERRCODE='P5501';END IF;
  SELECT COALESCE(sum(amount),0) INTO v_balance FROM ayuzee_finance.entries WHERE account_id=a.id;
  IF v_balance+e.amount<0 OR v_balance+e.amount>9000000000000000 THEN RAISE EXCEPTION 'Wallet funds unavailable or limit exceeded' USING ERRCODE='P5501';END IF;
  INSERT INTO ayuzee_finance.journals(event_id) VALUES(e.id);
  INSERT INTO ayuzee_finance.entries(event_id,account_id,amount) VALUES(e.id,a.id,e.amount),(e.id,c.id,-e.amount);
  RETURN jsonb_build_object('event_id',e.id,'posted',true);
 ELSE RAISE EXCEPTION 'Unknown wallet action' USING ERRCODE='22023';END IF;
END $$;
CREATE FUNCTION public.wallet_ledger_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_finance.wallet_worker(p_action,p_payload)$$;
REVOKE ALL ON FUNCTION ayuzee_finance.immutable_entry(),ayuzee_finance.check_journal(),ayuzee_finance.live_actor(text),ayuzee_finance.wallet_read(jsonb),public.wallet_ledger_status(jsonb),ayuzee_finance.wallet_worker(text,jsonb),public.wallet_ledger_worker(text,jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION ayuzee_finance.wallet_read(jsonb),public.wallet_ledger_status(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_finance.wallet_worker(text,jsonb),public.wallet_ledger_worker(text,jsonb) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
