import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {scopedFixture,localRepair,id} from '../tests/database/scoped-fixture.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('catalog candidate against inspected schema and existing access repairs',async t=>{
 const db=new PGlite();
 async function request(n,fn,role='authenticated'){
  await db.exec(`SET SESSION AUTHORIZATION authenticator; SET ROLE ${role}`);
  try{await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[n?id(n):'',role]);return await fn();}
  finally{await db.exec("SET SESSION AUTHORIZATION postgres; RESET ROLE; SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");}
 }
 const rpc=(n,w,action,payload={})=>request(n,async()=>{const r=await db.query('SELECT public.commerce_catalog($1,$2) AS data',[action,{...payload,workspace:w}]);return r.rows[0].data;},n?'authenticated':'anon');
 const catalog=(patch={})=>rpc(null,null,'catalog',{page:1,sort:'name',...patch});
 const manage=(n,w,status='pending')=>rpc(n,w,'manage',{page:1,status});
 const denied=fn=>assert.rejects(fn,e=>e.code==='42501');
 const draft={name:'Sample catalog product',description:'Fictional general product description.',category:'Personal care',system:'Wellness',price_paise:12550,mrp_paise:15000,stock:10,prescription_required:false};
 let productId,revision;
 try{
  const f=await scopedFixture();await db.exec(f.sql);await db.exec(await localRepair(db,f.metadata,'supabase/migrations/20261103193309_phase0_2_scoped_access.sql'));
  await db.exec(await read('supabase/migrations/20261103195736_auth_lifecycle_permissions.sql'));
  await db.exec('DROP TRIGGER fixture_signup ON auth.users; DROP FUNCTION public.fixture_signup()');
  await db.exec(await read('supabase/migrations/20261104040057_account_onboarding_contract.sql'));
  const meta=JSON.parse(await read('tests/database/commerce-metadata.json'));
  const quote=value=>'"'+value.replaceAll('"','""')+'"';
  for(const table of ['products','orders']){
   const cols=meta.columns.filter(c=>c.table===table).map(c=>`${quote(c.name)} ${c.udt.startsWith('_')?c.udt.slice(1)+'[]':c.udt}${c.default?' DEFAULT '+c.default:''}${c.nullable==='NO'?' NOT NULL':''}`);
   await db.exec(`CREATE TABLE public.${table}(${cols.join(',')});ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;GRANT ALL ON public.${table} TO anon,authenticated,service_role;`);
   for(const c of meta.constraints.filter(c=>c.table===table))await db.exec(`ALTER TABLE public.${table} ADD CONSTRAINT ${quote(c.name)} ${c.definition}`);
   for(const p of meta.policies.filter(p=>p.table===table))await db.exec(`CREATE POLICY ${quote(p.name)} ON public.${table} FOR ${p.command} TO ${p.roles.join(',')}${p.using?' USING('+p.using+')':''}${p.check?' WITH CHECK('+p.check+')':''}`);
  }
  await db.exec(`INSERT INTO public.user_roles(user_id,role) VALUES('${id(1)}','manufacturer'),('${id(2)}','manufacturer'),('${id(4)}','product_admin'),('${id(10)}','orders_admin')`);
  // Negative control: leftover column-level grants must not bypass write fences.
  await db.exec('GRANT UPDATE(total,payment_status),INSERT(user_id,total,payment_status) ON public.orders TO authenticated');
  await db.exec(await read('supabase/review-candidates/phase3-catalog.sql'));
  await t.test('anonymous catalog is empty without inventing inventory',async()=>{assert.deepEqual((await catalog()).products,[]);assert.equal((await catalog()).hasMore,false);});
  await t.test('only canonical manufacturers submit and owner/publication fields are server derived',async()=>{
   await denied(()=>rpc(3,'patient','submit',draft));await denied(()=>rpc(1,'admin','submit',draft));
   productId=(await rpc(1,'manufacturer','submit',{...draft,seller_id:id(5),approval_status:'approved',is_active:true})).id;
   const row=(await db.query('SELECT * FROM public.products WHERE id=$1',[productId])).rows[0];assert.equal(row.seller_id,id(1));assert.equal(row.approval_status,'pending');assert.equal(row.is_active,false);
   assert.equal((await catalog()).products.length,0);
  });
  await t.test('manufacturer management lists only owned rows',async()=>{
   const own=await manage(1,'manufacturer');assert.equal(own.products.length,1);assert.equal(own.viewer.reviewer,false);revision=own.products[0].revision;
   assert.deepEqual((await manage(2,'manufacturer')).products,[]);await denied(()=>manage(1,'product_admin'));
  });
  await t.test('anonymous and ordinary accounts cannot discover pending products or private owner ids',async()=>{
   assert.equal((await rpc(null,null,'product',{id:productId})).product,null);
   assert.equal((await request(null,()=>db.query('SELECT id,name FROM public.products'),'anon')).rows.length,0);
   await denied(()=>request(null,()=>db.query('SELECT seller_id FROM public.products'),'anon'));
   await denied(()=>request(3,()=>db.query('SELECT seller_id FROM public.products')));
  });
  await t.test('direct browser writes cannot forge catalog approval, price or stock',async()=>{
   await denied(()=>request(3,()=>db.query("UPDATE public.products SET approval_status='approved',is_active=true WHERE id=$1",[productId])));
   await denied(()=>request(1,()=>db.query('UPDATE public.products SET price=0,stock=999 WHERE id=$1',[productId])));
   await denied(()=>request(3,()=>db.query("INSERT INTO public.products(name,price) VALUES('Forged product',1)")));
  });
  await t.test('approval requires a current snapshot, a reason and the dedicated role',async()=>{
   await denied(()=>rpc(1,'manufacturer','review',{id:productId,revision,decision:'approved',reason:'Attempt to self-approve.'}));
   await denied(()=>rpc(11,'doctor_admin','review',{id:productId,revision,decision:'approved',reason:'Wrong delegated admin role.'}));
   await assert.rejects(()=>rpc(4,'product_admin','review',{id:productId,revision:'old',decision:'approved',reason:'A stale catalog review.'}),e=>e.code==='40001');
   await assert.rejects(()=>rpc(4,'product_admin','review',{id:productId,revision,decision:'approved',reason:'short'}),e=>e.code==='22023');
   await rpc(4,'product_admin','review',{id:productId,revision,decision:'approved',reason:'Reviewed the publication fields for this fixture.'});
  });
  await t.test('public projection exposes only approved active fields and exact paise',async()=>{
   const row=(await catalog()).products[0];assert.equal(row.price_paise,12550);assert.equal(row.mrp_paise,15000);assert.equal(row.available,true);
   assert.equal(row.seller_id,undefined);assert.equal(row.manufacturer_id,undefined);assert.equal(row.approval_status,undefined);
   assert.equal((await request(null,()=>db.query('SELECT id FROM public.products_public'),'anon')).rows.length,1);
  });
  await t.test('manufacturer edits require ownership and force fresh approval',async()=>{
   const approved=(await manage(1,'manufacturer','approved')).products[0];
   await denied(()=>rpc(2,'manufacturer','submit',{...draft,id:productId,revision:approved.revision,name:'Another owner tried this'}));
   await assert.rejects(()=>rpc(1,'manufacturer','submit',{...draft,id:productId,revision}),e=>e.code==='40001');
   await rpc(1,'manufacturer','submit',{...draft,id:productId,revision:approved.revision,price_paise:13000});
   assert.equal((await catalog()).products.length,0);revision=(await manage(1,'manufacturer')).products[0].revision;
  });
  await t.test('reject, resubmit and withdrawal persist audited valid transitions',async()=>{
   await rpc(5,'admin','review',{id:productId,revision,decision:'rejected',reason:'Product details need further review.'});
   const rejected=(await manage(1,'manufacturer','rejected')).products[0];assert.equal(rejected.review_reason,'Product details need further review.');
   await rpc(1,'manufacturer','submit',{...draft,id:productId,revision:rejected.revision});revision=(await manage(1,'manufacturer')).products[0].revision;
   await rpc(4,'product_admin','review',{id:productId,revision,decision:'approved',reason:'Revised publication details reviewed.'});
   revision=(await manage(4,'product_admin','approved')).products[0].revision;
   const previouslyApprovedRevision=revision;
   await rpc(4,'product_admin','review',{id:productId,revision,decision:'withdrawn',reason:'Withdrawn pending another publication review.'});assert.equal((await catalog()).products.length,0);assert.notEqual((await manage(1,'manufacturer')).products[0].revision,previouslyApprovedRevision);
   assert.ok((await db.query('SELECT count(*)::integer n FROM ayuzee_commerce.commerce_product_audit')).rows[0].n>=6);
   await denied(()=>request(1,()=>db.query('SELECT * FROM ayuzee_commerce.commerce_product_audit')));
  });
  await t.test('audit persistence failure rolls back publication atomically',async()=>{
   const pending=(await manage(1,'manufacturer')).products[0];
   await db.exec("CREATE FUNCTION public.fixture_catalog_audit_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic audit persistence failure'; END $$; CREATE TRIGGER fixture_catalog_audit_fail BEFORE INSERT ON ayuzee_commerce.commerce_product_audit FOR EACH ROW EXECUTE FUNCTION public.fixture_catalog_audit_fail()");
   await assert.rejects(()=>rpc(4,'product_admin','review',{id:productId,revision:pending.revision,decision:'approved',reason:'This must roll back if the audit cannot persist.'}),/Synthetic audit persistence failure/);
   assert.equal((await catalog()).products.length,0);assert.equal((await manage(1,'manufacturer')).products[0].revision,pending.revision);
   await db.exec('DROP TRIGGER fixture_catalog_audit_fail ON ayuzee_commerce.commerce_product_audit; DROP FUNCTION public.fixture_catalog_audit_fail()');
  });
  await t.test('reviewer role revocation and anonymous management fail closed',async()=>{
   await denied(()=>rpc(null,null,'manage',{status:'pending',page:1}));
   await db.query("DELETE FROM public.user_roles WHERE user_id=$1 AND role='product_admin'",[id(4)]);await denied(()=>manage(4,'product_admin'));
   await db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'product_admin')",[id(4)]);
  });
  await t.test('dual-role reviewers cannot approve their own products',async()=>{
   await db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'product_admin')",[id(1)]);revision=(await manage(1,'manufacturer')).products[0].revision;
   await denied(()=>rpc(1,'product_admin','review',{id:productId,revision,decision:'approved',reason:'Self-review is not permitted.'}));
  });
  await t.test('invalid amounts, quantities and prescription flags are rejected',async()=>{
   for(const patch of [{price_paise:0},{price_paise:-1},{price_paise:1.5},{mrp_paise:2},{stock:-1},{stock:1.5},{prescription_required:null},{prescription_required:'false'}])await assert.rejects(()=>rpc(1,'manufacturer','submit',{...draft,...patch}));
  });
  await t.test('role removal and account deletion invalidate management immediately',async()=>{
   await db.query("DELETE FROM public.user_roles WHERE user_id=$1 AND role='manufacturer'",[id(2)]);await denied(()=>manage(2,'manufacturer'));
   await db.query('UPDATE auth.users SET deleted_at=now() WHERE id=$1',[id(1)]);await denied(()=>manage(1,'manufacturer'));await db.query('UPDATE auth.users SET deleted_at=null WHERE id=$1',[id(1)]);
  });
  await t.test('order readers are owner/operations scoped and payment states cannot be forged',async()=>{
   await db.query('INSERT INTO public.orders(user_id,total) VALUES($1,100),($2,200)',[id(1),id(2)]);
   assert.equal((await request(1,()=>db.query('SELECT total FROM public.orders'))).rows.length,1);
   assert.equal((await request(4,()=>db.query('SELECT total FROM public.orders'))).rows.length,0);
   assert.equal((await request(10,()=>db.query('SELECT total FROM public.orders'))).rows.length,2);
   assert.equal((await request(5,()=>db.query('SELECT total FROM public.orders'))).rows.length,2);
   await denied(()=>request(1,()=>db.query("UPDATE public.orders SET payment_status='paid',total=0 WHERE user_id=$1",[id(1)])));
   await denied(()=>request(1,()=>db.query("INSERT INTO public.orders(user_id,total,payment_status) VALUES($1,0,'paid')",[id(1)])));
  });
  await t.test('literal search, filters and stable pagination use only public rows',async()=>{
   for(let n=0;n<15;n++)await db.query("INSERT INTO public.products(name,description,category,ayush_system,price,stock,approval_status,is_active) VALUES($1,'Synthetic product description','Personal care','Wellness',100,1,'approved',true)",['Catalog fixture '+n]);
   const one=await catalog(),two=await catalog({page:2});assert.equal(one.products.length,12);assert.equal(one.hasMore,true);assert.equal(two.products.length,3);assert.equal(new Set([...one.products,...two.products].map(p=>p.id)).size,15);
   assert.deepEqual((await catalog({query:'%'})).products,[]);assert.deepEqual((await catalog({category:'Unpublished private category'})).products,[]);
   await assert.rejects(()=>catalog({page:0}),e=>e.code==='22023');
  });
 }finally{await db.close();}
});
