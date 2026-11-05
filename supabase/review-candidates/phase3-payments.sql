-- Phase 3.4–3.5 LOCAL ONLY. Requires catalog + checkout candidates.
-- Test integration only; no keys, provider calls, scheduler or hosted deployment.
BEGIN;
CREATE TABLE ayuzee_commerce.payment_policy(
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),enabled boolean NOT NULL DEFAULT false,
 integration text CHECK(integration ~ '^rzp_test_[A-Za-z0-9]{3,80}$')
);
INSERT INTO ayuzee_commerce.payment_policy DEFAULT VALUES;
CREATE TABLE ayuzee_commerce.payment_attempts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_id uuid NOT NULL UNIQUE, -- Retain transaction identity after an account/order is removed.

 user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,workspace text NOT NULL,session_id uuid NOT NULL,integration text NOT NULL,
 amount_paise bigint NOT NULL CHECK(amount_paise BETWEEN 1 AND 1000000000),currency text NOT NULL DEFAULT 'INR' CHECK(currency='INR'),
 state text NOT NULL DEFAULT 'queued' CHECK(state IN('queued','creating','uncertain','ready','verified','review_required')),
 provider_order_id text UNIQUE CHECK(provider_order_id ~ '^order_[A-Za-z0-9]{3,80}$'),claim_token uuid,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX payment_attempts_owner ON ayuzee_commerce.payment_attempts(user_id,created_at DESC);
CREATE INDEX payment_attempts_reconcile ON ayuzee_commerce.payment_attempts(updated_at,id) WHERE state IN('creating','uncertain','ready');
CREATE TABLE ayuzee_commerce.payment_receipts(
 integration text NOT NULL,payment_id text NOT NULL CHECK(payment_id ~ '^pay_[A-Za-z0-9]{3,80}$'),
 attempt_id uuid NOT NULL REFERENCES ayuzee_commerce.payment_attempts(id) ON DELETE CASCADE,
 disposition text NOT NULL CHECK(disposition IN('confirmed','review_required')),reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(integration,payment_id)
);
CREATE INDEX payment_receipts_attempt ON ayuzee_commerce.payment_receipts(attempt_id);
CREATE TABLE ayuzee_commerce.payment_inbox(
 integration text NOT NULL,event_id text NOT NULL CHECK(length(event_id) BETWEEN 1 AND 100),body_hash text NOT NULL CHECK(body_hash ~ '^[a-f0-9]{64}$'),
 provider_order_id text NOT NULL CHECK(provider_order_id ~ '^order_[A-Za-z0-9]{3,80}$'),payment_id text NOT NULL CHECK(payment_id ~ '^pay_[A-Za-z0-9]{3,80}$'),
 event_type text NOT NULL CHECK(event_type IN('payment.captured','payment.authorized','payment.failed','order.paid')),
 state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','processing','done','dead')),attempts integer NOT NULL DEFAULT 0,
 lease_token uuid,lease_until timestamptz,next_at timestamptz NOT NULL DEFAULT clock_timestamp(),last_code text,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),PRIMARY KEY(integration,event_id)
);
CREATE INDEX payment_inbox_work ON ayuzee_commerce.payment_inbox(next_at,created_at) WHERE state IN('pending','processing');
CREATE TABLE ayuzee_commerce.payment_audit(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),attempt_id uuid NOT NULL REFERENCES ayuzee_commerce.payment_attempts(id) ON DELETE CASCADE,
 kind text NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX payment_audit_attempt ON ayuzee_commerce.payment_audit(attempt_id);
DO $$ DECLARE t text;BEGIN FOREACH t IN ARRAY ARRAY['payment_policy','payment_attempts','payment_receipts','payment_inbox','payment_audit'] LOOP
 EXECUTE format('ALTER TABLE ayuzee_commerce.%I ENABLE ROW LEVEL SECURITY',t);EXECUTE format('REVOKE ALL ON ayuzee_commerce.%I FROM PUBLIC,anon,authenticated',t);
END LOOP;END $$;
CREATE FUNCTION ayuzee_commerce.payment_public(p_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('id',a.id,'order_id',a.order_id,'amount_paise',a.amount_paise,'currency',a.currency,'mode','test','state',a.state,
 'provider_order_id',a.provider_order_id,'captured',EXISTS(SELECT 1 FROM ayuzee_commerce.payment_receipts r WHERE r.attempt_id=a.id),
 'review_required',EXISTS(SELECT 1 FROM ayuzee_commerce.payment_receipts r WHERE r.attempt_id=a.id AND r.disposition='review_required')) FROM ayuzee_commerce.payment_attempts a WHERE a.id=p_id
$$;
CREATE FUNCTION ayuzee_commerce.payment_customer(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE u uuid:=auth.uid();ord public.orders;h ayuzee_commerce.stock_holds;a ayuzee_commerce.payment_attempts;cfg ayuzee_commerce.payment_policy;v_amount bigint;
BEGIN
 IF NOT ayuzee_commerce.checkout_live_session() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=p_payload->>'workspace') THEN RAISE EXCEPTION 'Payment access denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR p_payload-ARRAY['workspace','order_id']<>'{}'::jsonb OR p_payload->>'order_id' IS NULL THEN RAISE EXCEPTION 'Invalid payment request' USING ERRCODE='22023';END IF;
 IF p_action NOT IN('prepare','status') THEN RAISE EXCEPTION 'Invalid payment action' USING ERRCODE='22023';END IF;
 SELECT * INTO ord FROM public.orders WHERE id=(p_payload->>'order_id')::uuid AND user_id=u FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order unavailable' USING ERRCODE='42501';END IF;
 SELECT * INTO a FROM ayuzee_commerce.payment_attempts WHERE order_id=ord.id;
 IF FOUND THEN IF p_action='prepare' AND a.state='queued' THEN UPDATE ayuzee_commerce.payment_attempts SET workspace=p_payload->>'workspace',session_id=(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id')::uuid WHERE id=a.id;END IF;RETURN jsonb_build_object('attempt',ayuzee_commerce.payment_public(a.id));END IF;
 IF p_action='status' THEN RETURN jsonb_build_object('attempt',NULL);END IF;
 SELECT * INTO cfg FROM ayuzee_commerce.payment_policy WHERE singleton FOR SHARE;
 IF NOT cfg.enabled OR cfg.integration IS NULL THEN RAISE EXCEPTION 'Payments disabled' USING ERRCODE='P5200';END IF;
 SELECT * INTO h FROM ayuzee_commerce.stock_holds WHERE order_id=ord.id FOR UPDATE;
 IF NOT FOUND OR h.order_id IS NULL OR h.state<>'held' OR h.expires_at<=clock_timestamp() OR ord.payment_status<>'unpaid' OR ord.order_status<>'pending' THEN RAISE EXCEPTION 'Order cannot accept payment' USING ERRCODE='P5201';END IF;
 SELECT (pricing->>'total_paise')::bigint INTO v_amount FROM ayuzee_commerce.checkout_quotes WHERE id=h.quote_id;
 IF v_amount IS NULL OR ord.total*100<>v_amount THEN RAISE EXCEPTION 'Order total mismatch' USING ERRCODE='P5202';END IF;
 INSERT INTO ayuzee_commerce.payment_attempts(order_id,user_id,workspace,session_id,integration,amount_paise) VALUES(ord.id,u,p_payload->>'workspace',(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'session_id')::uuid,cfg.integration,v_amount) RETURNING * INTO a;
 INSERT INTO ayuzee_commerce.payment_audit(attempt_id,kind) VALUES(a.id,'prepared');
 RETURN jsonb_build_object('attempt',ayuzee_commerce.payment_public(a.id));
END $$;
CREATE FUNCTION public.commerce_payment(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.payment_customer(p_action,p_payload)$$;
CREATE FUNCTION ayuzee_commerce.payment_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' SET lock_timeout='5s' AS $$
DECLARE a ayuzee_commerce.payment_attempts;ord public.orders;h ayuzee_commerce.stock_holds;cfg ayuzee_commerce.payment_policy;r ayuzee_commerce.payment_receipts;e ayuzee_commerce.payment_inbox;
 v_id uuid;v_pid text;v_disposition text;v_reason text;v_token uuid;result jsonb;bad boolean;
BEGIN
 IF NOT ayuzee_private.rbac_server() THEN RAISE EXCEPTION 'Payment worker denied' USING ERRCODE='42501';END IF;
 IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' OR pg_column_size(p_payload)>16000 THEN RAISE EXCEPTION 'Invalid worker payload' USING ERRCODE='22023';END IF;
 IF p_action='list' THEN
  SELECT COALESCE(jsonb_agg(to_jsonb(x)),'[]'::jsonb) INTO result FROM(SELECT * FROM ayuzee_commerce.payment_attempts WHERE integration=p_payload->>'integration' AND state IN('creating','uncertain','ready') ORDER BY updated_at,id LIMIT 20)x;RETURN result;
 ELSIF p_action='lookup' THEN
  SELECT * INTO a FROM ayuzee_commerce.payment_attempts WHERE provider_order_id=p_payload->>'provider_order_id' AND integration=p_payload->>'integration';RETURN to_jsonb(a);
 ELSIF p_action='inbox' THEN
  INSERT INTO ayuzee_commerce.payment_inbox(integration,event_id,body_hash,provider_order_id,payment_id,event_type) VALUES(p_payload->>'integration',p_payload->>'event_id',p_payload->>'body_hash',p_payload->>'provider_order_id',p_payload->>'payment_id',p_payload->>'event_type') ON CONFLICT DO NOTHING;
  SELECT * INTO e FROM ayuzee_commerce.payment_inbox WHERE integration=p_payload->>'integration' AND event_id=p_payload->>'event_id';
  IF e.body_hash IS DISTINCT FROM p_payload->>'body_hash' THEN RAISE EXCEPTION 'Event identity conflict' USING ERRCODE='P5203';END IF;RETURN jsonb_build_object('accepted',true);
 ELSIF p_action='claim_events' THEN
  UPDATE ayuzee_commerce.payment_inbox SET state='dead',last_code='retry_exhausted' WHERE integration=p_payload->>'integration' AND state='processing' AND attempts>=8 AND lease_until<=clock_timestamp();
  WITH picked AS(SELECT integration,event_id FROM ayuzee_commerce.payment_inbox WHERE integration=p_payload->>'integration' AND attempts<8 AND next_at<=clock_timestamp() AND (state='pending' OR(state='processing' AND lease_until<=clock_timestamp())) ORDER BY created_at,event_id LIMIT 20 FOR UPDATE SKIP LOCKED),changed AS(
   UPDATE ayuzee_commerce.payment_inbox i SET state='processing',attempts=i.attempts+1,lease_token=gen_random_uuid(),lease_until=clock_timestamp()+interval '1 minute' FROM picked p WHERE i.integration=p.integration AND i.event_id=p.event_id RETURNING i.*)
  SELECT COALESCE(jsonb_agg(to_jsonb(changed)),'[]'::jsonb) INTO result FROM changed;RETURN result;
 ELSIF p_action='finish_event' THEN
  IF p_payload->>'code' NOT IN('done','retry','invalid','unbound') THEN RAISE EXCEPTION 'Invalid event outcome' USING ERRCODE='22023';END IF;
  UPDATE ayuzee_commerce.payment_inbox SET state=CASE WHEN p_payload->>'code'='done' THEN 'done' WHEN p_payload->>'code'='invalid' OR attempts>=8 THEN 'dead' ELSE 'pending' END,
   last_code=p_payload->>'code',next_at=clock_timestamp()+interval '30 seconds',lease_until=NULL WHERE integration=p_payload->>'integration' AND event_id=p_payload->>'event_id' AND state='processing' AND lease_token=(p_payload->>'lease_token')::uuid;
  RETURN jsonb_build_object('updated',FOUND);
 END IF;
 v_id:=(p_payload->>'id')::uuid;
 SELECT * INTO a FROM ayuzee_commerce.payment_attempts WHERE id=v_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Attempt unavailable' USING ERRCODE='42501';END IF;
 -- Shared order → attempt → hold → sorted products lock order. No external I/O here.
 SELECT * INTO ord FROM public.orders WHERE id=a.order_id FOR UPDATE;
 SELECT * INTO a FROM ayuzee_commerce.payment_attempts WHERE id=v_id FOR UPDATE;
 IF a.integration IS DISTINCT FROM p_payload->>'integration' THEN RAISE EXCEPTION 'Integration mismatch' USING ERRCODE='42501';END IF;
 IF p_action='get' THEN RETURN to_jsonb(a);
 ELSIF p_action='checked' THEN UPDATE ayuzee_commerce.payment_attempts SET updated_at=clock_timestamp() WHERE id=a.id;RETURN jsonb_build_object('checked',true);
 ELSIF p_action='claim' THEN
  SELECT * INTO cfg FROM ayuzee_commerce.payment_policy WHERE singleton FOR SHARE;
  SELECT * INTO h FROM ayuzee_commerce.stock_holds WHERE order_id=ord.id FOR UPDATE;
  IF NOT cfg.enabled OR cfg.integration IS DISTINCT FROM a.integration OR h.order_id IS NULL OR h.state<>'held' OR h.expires_at<=clock_timestamp() OR ord.payment_status<>'unpaid' OR ord.order_status<>'pending' THEN RAISE EXCEPTION 'Payment initiation unavailable' USING ERRCODE='P5201';END IF;
  IF NOT EXISTS(SELECT 1 FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id JOIN public.user_roles g ON g.user_id=u.id WHERE u.id=a.user_id AND u.deleted_at IS NULL AND u.email_confirmed_at IS NOT NULL AND s.id=a.session_id AND(s.not_after IS NULL OR s.not_after>clock_timestamp()) AND g.role::text=a.workspace) THEN RAISE EXCEPTION 'Payment session revoked' USING ERRCODE='42501';END IF;
  IF a.state='queued' THEN UPDATE ayuzee_commerce.payment_attempts SET state='creating',claim_token=gen_random_uuid(),updated_at=clock_timestamp() WHERE id=a.id RETURNING * INTO a;RETURN jsonb_build_object('claimed',true,'attempt',to_jsonb(a));END IF;
  RETURN jsonb_build_object('claimed',false,'attempt',to_jsonb(a));
 ELSIF p_action='uncertain' THEN
  UPDATE ayuzee_commerce.payment_attempts SET state='uncertain',updated_at=clock_timestamp() WHERE id=a.id AND state='creating' AND claim_token=(p_payload->>'claim_token')::uuid;RETURN to_jsonb(a);
 ELSIF p_action='bind' THEN
  IF (p_payload->>'provider_order_id' ~ '^order_[A-Za-z0-9]{3,80}$') IS NOT TRUE OR a.claim_token IS DISTINCT FROM (p_payload->>'claim_token')::uuid OR a.claim_token IS NULL OR p_payload->>'receipt' IS DISTINCT FROM a.id::text OR (p_payload->>'amount')::bigint IS DISTINCT FROM a.amount_paise OR p_payload->>'currency' IS DISTINCT FROM a.currency THEN RAISE EXCEPTION 'Provider order binding mismatch' USING ERRCODE='P5202';END IF;
  IF a.provider_order_id IS NOT NULL AND a.provider_order_id IS DISTINCT FROM p_payload->>'provider_order_id' THEN RAISE EXCEPTION 'Provider order already bound' USING ERRCODE='P5202';END IF;
  IF a.state NOT IN('creating','uncertain','ready','verified','review_required') THEN RAISE EXCEPTION 'Invalid attempt state' USING ERRCODE='P5202';END IF;
  UPDATE ayuzee_commerce.payment_attempts SET provider_order_id=p_payload->>'provider_order_id',state=CASE WHEN state IN('creating','uncertain') THEN 'ready' ELSE state END,updated_at=clock_timestamp() WHERE id=a.id RETURNING * INTO a;RETURN to_jsonb(a);
 ELSIF p_action='settle' THEN
  v_pid:=p_payload->>'payment_id';
  IF ord.total*100<>a.amount_paise OR a.provider_order_id IS NULL OR a.provider_order_id IS DISTINCT FROM p_payload->>'provider_order_id' OR a.id::text IS DISTINCT FROM p_payload->>'receipt' OR (p_payload->>'amount')::bigint IS DISTINCT FROM a.amount_paise OR p_payload->>'currency' IS DISTINCT FROM a.currency OR p_payload->>'status' IS DISTINCT FROM 'captured' OR p_payload->'captured' IS DISTINCT FROM 'true'::jsonb OR COALESCE((p_payload->>'amount_refunded')::bigint,-1)<>0 THEN RAISE EXCEPTION 'Payment evidence mismatch' USING ERRCODE='P5202';END IF;
  SELECT * INTO r FROM ayuzee_commerce.payment_receipts WHERE integration=a.integration AND payment_id=v_pid;
  IF FOUND THEN IF r.attempt_id<>a.id THEN RAISE EXCEPTION 'Payment already consumed' USING ERRCODE='P5202';END IF;RETURN ayuzee_commerce.payment_public(a.id);END IF;
  SELECT * INTO h FROM ayuzee_commerce.stock_holds WHERE order_id=ord.id FOR UPDATE;
  PERFORM p.id FROM public.products p JOIN ayuzee_commerce.stock_hold_lines l ON l.product_id=p.id WHERE l.order_id=ord.id ORDER BY p.id FOR UPDATE OF p;
  SELECT NOT EXISTS(SELECT 1 FROM ayuzee_commerce.stock_hold_lines WHERE order_id=ord.id) OR EXISTS(SELECT 1 FROM ayuzee_commerce.stock_hold_lines l JOIN public.products p ON p.id=l.product_id WHERE l.order_id=ord.id AND(p.is_active IS NOT TRUE OR p.approval_status IS DISTINCT FROM 'approved' OR p.is_prescription_required IS NOT FALSE OR COALESCE(p.stock,0)<(SELECT COALESCE(sum(s.quantity),0) FROM ayuzee_commerce.stock_hold_lines s JOIN ayuzee_commerce.stock_holds sh USING(order_id) WHERE s.product_id=p.id AND sh.state='held' AND sh.expires_at>clock_timestamp()))) INTO bad;
  IF EXISTS(SELECT 1 FROM ayuzee_commerce.payment_receipts WHERE attempt_id=a.id) THEN v_disposition:='review_required';v_reason:='additional_capture';
  ELSIF h.state IS DISTINCT FROM 'held' OR h.expires_at<=clock_timestamp() OR ord.payment_status<>'unpaid' OR ord.order_status<>'pending' OR bad THEN v_disposition:='review_required';v_reason:='reservation_unavailable';
  ELSE
   v_disposition:='confirmed';v_reason:='verified_capture';
   UPDATE public.products p SET stock=p.stock-l.quantity FROM ayuzee_commerce.stock_hold_lines l WHERE l.order_id=ord.id AND p.id=l.product_id;
   UPDATE ayuzee_commerce.stock_holds SET state='committed' WHERE order_id=ord.id;
   UPDATE public.orders SET payment_status='paid',order_status='confirmed',updated_at=clock_timestamp() WHERE id=ord.id;
  END IF;
  INSERT INTO ayuzee_commerce.payment_receipts(integration,payment_id,attempt_id,disposition,reason) VALUES(a.integration,v_pid,a.id,v_disposition,v_reason);
  UPDATE ayuzee_commerce.payment_attempts SET state=CASE WHEN v_disposition='confirmed' AND state<>'review_required' THEN 'verified' ELSE 'review_required' END,updated_at=clock_timestamp() WHERE id=a.id;
  INSERT INTO ayuzee_commerce.payment_audit(attempt_id,kind) VALUES(a.id,v_reason);
  RETURN ayuzee_commerce.payment_public(a.id);
 ELSE RAISE EXCEPTION 'Invalid worker action' USING ERRCODE='22023';END IF;
END $$;
CREATE FUNCTION public.commerce_payment_worker(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$SELECT ayuzee_commerce.payment_worker(p_action,p_payload)$$;
REVOKE ALL ON FUNCTION ayuzee_commerce.payment_public(uuid),ayuzee_commerce.payment_customer(text,jsonb),public.commerce_payment(text,jsonb),ayuzee_commerce.payment_worker(text,jsonb),public.commerce_payment_worker(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.payment_customer(text,jsonb),public.commerce_payment(text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION ayuzee_commerce.payment_worker(text,jsonb),public.commerce_payment_worker(text,jsonb) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
