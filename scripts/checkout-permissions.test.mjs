import{test}from'node:test';import assert from'node:assert/strict';import{PGlite}from'@electric-sql/pglite';import{checkoutFixture}from'../tests/database/commerce-fixture.mjs';import{id}from'../tests/database/scoped-fixture.mjs';
const address={full_name:'Synthetic Buyer',phone:'9999999999',address_line1:'12 Example Road',address_line2:'',city:'Chennai',state:'Tamil Nadu',pincode:'600001'};
test('server checkout candidate validates pricing and reservation lifecycle',async t=>{
 const db=new PGlite();
 async function request(n,fn,role='authenticated'){await db.exec(`SET SESSION AUTHORIZATION authenticator;SET ROLE ${role}`);try{await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[n?id(n):'',role]);await db.query("SELECT set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:n?id(n):'',role,session_id:n?'10000000-0000-0000-0000-'+String(n).padStart(12,'0'):null})]);return await fn();}finally{await db.exec("SET SESSION AUTHORIZATION postgres;RESET ROLE;SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false),set_config('request.jwt.claims','',false)");}}
 const api=(n,action,payload={})=>request(n,async()=>{const r=await db.query('SELECT public.commerce_checkout($1,$2) data',[action,{workspace:'patient',...payload}]);return r.rows[0].data;});
 const quote=(n,patch={})=>api(n,'quote',{items:[{product_id:id(801),quantity:2}],postal_code:'600001',...patch});
 const reserve=(n,q,key,patch={})=>api(n,'reserve',{quote_id:q.id,request_key:id(key),address,...patch});
 const denied=fn=>assert.rejects(fn,e=>e.code==='42501');const fails=(code,fn)=>assert.rejects(fn,e=>e.code===code);
 try{await checkoutFixture(db);
  await db.query("INSERT INTO public.products(id,name,description,price,stock,is_active,approval_status,is_prescription_required) VALUES($1,'Local product','Fictional checkout fixture',125.55,20,true,'approved',false),($2,'Prescription fixture','Fictional prescription fixture',100,5,true,'approved',true)",[id(801),id(802)]);
  await t.test('missing rules fail closed rather than invent shipping/tax',async()=>{await fails('P5100',()=>quote(1));assert.equal((await db.query('SELECT count(*)::int n FROM public.orders')).rows[0].n,0);});
  await db.exec("UPDATE ayuzee_commerce.checkout_policy SET enabled=true,tax_mode='included',shipping_paise=4900,free_shipping_min_paise=50000,delivery_prefixes=ARRAY['600','560']");
  await t.test('server calculates exact integer paise and stable line snapshots',async()=>{const q=(await quote(1)).quote;assert.equal(q.subtotal_paise,25110);assert.equal(q.shipping_paise,4900);assert.equal(q.discount_paise,0);assert.equal(q.total_paise,30010);assert.equal(q.tax_mode,'included');assert.equal(q.lines[0].unit_paise,12555);assert.equal(q.policy_revision,undefined);assert.equal(q.lines[0].catalog_revision,undefined);});
  await t.test('client prices, totals, duplicate lines, non-integer quantities are rejected',async()=>{
   for(const patch of [{total:1},{user_id:id(2)},{items:[{product_id:id(801),quantity:1,price:0}]},{items:[{product_id:id(801),quantity:1},{product_id:id(801),quantity:1}]},{items:[{product_id:id(801),quantity:1.5}]},{items:[]},{items:[{product_id:id(801),quantity:100}]}])await fails('22023',()=>quote(1,patch));
  });
  await t.test('prescription, unpublished, unsupported postcode and insufficient stock block quotes',async()=>{
   await fails('P5103',()=>quote(1,{items:[{product_id:id(802),quantity:1}]}));await fails('P5110',()=>quote(1,{postal_code:'110001'}));await fails('P5101',()=>quote(1,{items:[{product_id:id(999),quantity:1}]}));await fails('P5102',()=>quote(1,{items:[{product_id:id(801),quantity:99}]}));
   await db.query('UPDATE public.products SET is_active=false WHERE id=$1',[id(801)]);await fails('P5101',()=>quote(1));await db.query('UPDATE public.products SET is_active=true WHERE id=$1',[id(801)]);
  });
  await db.exec("INSERT INTO ayuzee_commerce.checkout_coupons(code,enabled,kind,rate_bps,max_discount_paise,global_limit,per_user_limit) VALUES('TEN',true,'percent',1000,2000,1,1)");
  await t.test('discount caps and shipping thresholds are server-configured',async()=>{const q=(await quote(1,{coupon_code:' ten '})).quote;assert.equal(q.discount_paise,2000);assert.equal(q.total_paise,28010);const free=(await quote(1,{items:[{product_id:id(801),quantity:4}]})).quote;assert.equal(free.shipping_paise,0);});
  await t.test('expired/not-yet-valid and user-bound coupons fail closed',async()=>{
   await fails('P5107',()=>quote(1,{coupon_code:'UNKNOWN'}));await db.exec("UPDATE ayuzee_commerce.checkout_coupons SET expires_at=clock_timestamp()-interval '1 minute' WHERE code='TEN'");await fails('P5107',()=>quote(1,{coupon_code:'TEN'}));await db.query("UPDATE ayuzee_commerce.checkout_coupons SET expires_at=null,bound_user=$1 WHERE code='TEN'",[id(2)]);await fails('P5107',()=>quote(1,{coupon_code:'TEN'}));await db.exec("UPDATE ayuzee_commerce.checkout_coupons SET bound_user=null WHERE code='TEN'");
  });
  await t.test('all canonical workspaces require a current grant and never confer another customer identity',async()=>{
   const roles=(await db.query("SELECT enumlabel role FROM pg_enum WHERE enumtypid='public.app_role'::regtype")).rows.map(r=>r.role);
   for(const role of roles){if(role!=='patient')await db.query('INSERT INTO public.user_roles(user_id,role) VALUES($1,$2)',[id(1),role]);const r=await api(1,'orders',{workspace:role,page:1});assert.ok(Array.isArray(r.reservations));if(role!=='patient')await db.query('DELETE FROM public.user_roles WHERE user_id=$1 AND role::text=$2',[id(1),role]);}
   await denied(()=>api(1,'orders',{workspace:'super_admin'}));const q=(await quote(1)).quote;await db.query("DELETE FROM public.user_roles WHERE user_id=$1 AND role='patient'",[id(1)]);await denied(()=>reserve(1,q,970));await db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'patient')",[id(1)]);
  });
  await t.test('browser roles cannot read or mutate private rules, quotes or reservations',async()=>{for(const table of ['checkout_policy','checkout_coupons','checkout_quotes','stock_holds','checkout_events'])await denied(()=>request(1,()=>db.query('SELECT * FROM ayuzee_commerce.'+table)));await denied(()=>request(1,()=>db.query("UPDATE ayuzee_commerce.checkout_policy SET shipping_paise=0")));await denied(()=>request(null,()=>db.query("SELECT public.commerce_checkout('quote','{}')"),'anon'));});
  await t.test('a valid quote creates one pending unpaid owned order and holds stock',async()=>{const q=(await quote(1)).quote;const r=(await reserve(1,q,901)).reservation;assert.equal(r.payment_status,'unpaid');assert.equal(r.order_status,'pending');assert.equal(r.reservation_state,'held');assert.equal((await db.query('SELECT (total*100)::integer cents FROM public.orders WHERE id=$1',[r.order_id])).rows[0].cents,30010);assert.equal((await db.query('SELECT ayuzee_commerce.checkout_available($1) n',[id(801)])).rows[0].n,18);});
  await t.test('same key/quote/address returns the original order even after quote expiry',async()=>{const q=(await quote(1)).quote;const a=(await reserve(1,q,902)).reservation;await db.query("UPDATE ayuzee_commerce.checkout_quotes SET expires_at=clock_timestamp()-interval '1 hour' WHERE id=$1",[q.id]);const b=(await reserve(1,q,902)).reservation;assert.equal(a.order_id,b.order_id);await fails('P5109',()=>reserve(1,q,902,{address:{...address,address_line1:'Another Example Road'}}));});
  await t.test('request recovery returns the original owned receipt without shipping data',async()=>{
   const q=(await quote(1)).quote;const first=(await reserve(1,q,960)).reservation;
   const recovered=await api(1,'recover',{quote_id:q.id,request_key:id(960)});assert.equal(recovered.reservation.order_id,first.order_id);assert.equal(recovered.reservation.address,undefined);
   const other=await api(2,'recover',{quote_id:q.id,request_key:id(960)});assert.equal(other.reservation,null);assert.equal(other.quote,null);
   const pending=(await quote(1)).quote;const noOrder=await api(1,'recover',{quote_id:pending.id,request_key:id(961)});assert.equal(noOrder.reservation,null);assert.equal(noOrder.quote.id,pending.id);
  });
  await t.test('another key cannot consume the same quote twice',async()=>{const q=(await quote(1)).quote;await reserve(1,q,903);await fails('P5109',()=>reserve(1,q,904));});
  await t.test('another account cannot consume quotes, inspect receipts or release holds',async()=>{const q=(await quote(1)).quote;await denied(()=>reserve(2,q,905));const r=(await reserve(1,q,905)).reservation;await denied(()=>api(2,'status',{order_id:r.order_id}));await denied(()=>api(2,'release',{order_id:r.order_id}));});
  await t.test('reservation history is bounded and belongs only to the real actor',async()=>{
   const own=await api(1,'orders',{page:1});assert.ok(own.reservations.length>0);assert.ok(own.reservations.length<=12);
   for(const row of own.reservations)assert.equal((await db.query('SELECT user_id FROM public.orders WHERE id=$1',[row.order_id])).rows[0].user_id,id(1));
   await fails('22023',()=>api(1,'orders',{page:0}));
  });
  await t.test('expired quotes and altered delivery addresses do not create orders',async()=>{let q=(await quote(1)).quote;await db.query("UPDATE ayuzee_commerce.checkout_quotes SET expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",[q.id]);await fails('P5104',()=>reserve(1,q,906));q=(await quote(1)).quote;await fails('P5106',()=>reserve(1,q,907,{address:{...address,pincode:'560001'}}));});
  await t.test('price, policy and coupon revisions invalidate a previously displayed quote',async()=>{
   let q=(await quote(1)).quote;await db.query('UPDATE public.products SET price=126 WHERE id=$1',[id(801)]);await fails('P5105',()=>reserve(1,q,908));await db.query('UPDATE public.products SET price=125.55 WHERE id=$1',[id(801)]);
   q=(await quote(1)).quote;await db.exec('UPDATE ayuzee_commerce.checkout_policy SET shipping_paise=5000');await fails('P5105',()=>reserve(1,q,908));await db.exec('UPDATE ayuzee_commerce.checkout_policy SET shipping_paise=4900');
   q=(await quote(1,{coupon_code:'TEN'})).quote;await db.exec("UPDATE ayuzee_commerce.checkout_coupons SET rate_bps=900 WHERE code='TEN'");await fails('P5105',()=>reserve(1,q,908));await db.exec("UPDATE ayuzee_commerce.checkout_coupons SET rate_bps=1000 WHERE code='TEN'");
  });
  await t.test('coupon allocation is reserved atomically and released with the hold',async()=>{const q=(await quote(1,{coupon_code:'TEN'})).quote;const r=(await reserve(1,q,909)).reservation;await fails('P5108',()=>quote(2,{coupon_code:'TEN'}));await api(1,'release',{order_id:r.order_id});assert.ok((await quote(2,{coupon_code:'TEN'})).quote.id);});
  await t.test('expired holds free availability even before the worker runs',async()=>{await db.exec("UPDATE ayuzee_commerce.stock_holds SET expires_at=clock_timestamp()-interval '1 minute' WHERE state='held'");assert.equal((await db.query('SELECT ayuzee_commerce.checkout_available($1) n',[id(801)])).rows[0].n,20);await denied(()=>request(1,()=>db.query('SELECT public.expire_checkout_holds(100)')));const n=(await db.query('SELECT public.expire_checkout_holds(100) n')).rows[0].n;assert.ok(n>0);assert.equal((await db.query("SELECT count(*)::int n FROM public.orders WHERE order_status='pending'")).rows[0].n,0);});
  await t.test('audit failure rolls back order, hold and all reserved lines',async()=>{const q=(await quote(1)).quote;const before=(await db.query('SELECT count(*)::int n FROM public.orders')).rows[0].n;await db.exec("CREATE FUNCTION public.fixture_checkout_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic checkout audit failure';END $$;CREATE TRIGGER fixture_checkout_fail BEFORE INSERT ON ayuzee_commerce.checkout_events FOR EACH ROW EXECUTE FUNCTION public.fixture_checkout_fail()");await assert.rejects(()=>reserve(1,q,910),/Synthetic checkout audit failure/);assert.equal((await db.query('SELECT count(*)::int n FROM public.orders')).rows[0].n,before);assert.equal((await db.query('SELECT ayuzee_commerce.checkout_available($1) n',[id(801)])).rows[0].n,20);await db.exec('DROP TRIGGER fixture_checkout_fail ON ayuzee_commerce.checkout_events;DROP FUNCTION public.fixture_checkout_fail()');});
  await t.test('revoked and expired sessions cannot place orders with an old subject',async()=>{
   await db.query('UPDATE auth.users SET email_confirmed_at=null WHERE id=$1',[id(3)]);await denied(()=>quote(3));
   await db.query('UPDATE auth.users SET email_confirmed_at=clock_timestamp() WHERE id=$1',[id(3)]);
   await db.query('DELETE FROM auth.sessions WHERE user_id=$1',[id(3)]);await denied(()=>quote(3));
   await db.query("UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 minute' WHERE user_id=$1",[id(2)]);await denied(()=>quote(2));
   await db.query('UPDATE auth.sessions SET not_after=null WHERE user_id=$1',[id(2)]);
  });
  await t.test('Auth deletion cleans the account’s order/quote/hold dependency graph',async()=>{
   await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin');
   try{await db.query('INSERT INTO auth.users(id,email) VALUES($1,$2)',[id(50),'checkout-delete@example.invalid']);}finally{await db.exec('SET SESSION AUTHORIZATION postgres;RESET ROLE');}
   await db.query('INSERT INTO auth.sessions(id,user_id) VALUES($1,$2)',['10000000-0000-0000-0000-000000000050',id(50)]);
   const q=(await quote(50)).quote;await reserve(50,q,950);
   await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin');
   try{await db.query('DELETE FROM auth.users WHERE id=$1',[id(50)]);}finally{await db.exec('SET SESSION AUTHORIZATION postgres;RESET ROLE');}
   assert.equal((await db.query('SELECT count(*)::int n FROM ayuzee_commerce.stock_holds WHERE user_id=$1',[id(50)])).rows[0].n,0);
  });
  await t.test('client cannot manufacture paid/free states or inspect another customer order',async()=>{const q=(await quote(1)).quote;await fails('22023',()=>reserve(1,q,911,{payment_status:'paid',total:0}));const r=(await reserve(1,q,911)).reservation;await denied(()=>request(1,()=>db.query("UPDATE public.orders SET payment_status='paid',total=0 WHERE id=$1",[r.order_id])));assert.equal((await request(2,()=>db.query('SELECT id FROM public.orders WHERE id=$1',[r.order_id]))).rows.length,0);});
 }finally{await db.close();}
});
