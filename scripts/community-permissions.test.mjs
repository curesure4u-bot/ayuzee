import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {scopedFixture,localRepair,id} from '../tests/database/scoped-fixture.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('community candidate integrates with deployed access repairs',async t=>{
 const db=new PGlite();
 async function request(n,fn,role='authenticated'){
  await db.exec(`SET SESSION AUTHORIZATION authenticator; SET ROLE ${role}`);
  try{await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)",[n?id(n):'',role]);return await fn();}
  finally{await db.exec("SET SESSION AUTHORIZATION postgres; RESET ROLE; SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)");}
 }
 const rpc=(n,w,action,payload={})=>request(n,async()=>{const r=await db.query('SELECT public.community_portal($1,$2) AS data',[action,{...payload,workspace:w}]);return r.rows[0].data;});
 const feed=(n,w,patch={})=>rpc(n,w,'feed',{audience:'public',kind:'all',page:1,sort:'recent',...patch});
 const draft={title:'A thoughtful conversation',body:'A sufficiently detailed general community message.',kind:'discussion',audience:'public',options:[]};
 const denied=fn=>assert.rejects(fn,e=>e.code==='42501');
 let publicId,doctorId,patientId,pollId;
 try{
  const f=await scopedFixture();await db.exec(f.sql);
  await db.exec(await localRepair(db,f.metadata,'supabase/migrations/20261103193309_phase0_2_scoped_access.sql'));
  await db.exec(await read('supabase/migrations/20261103195736_auth_lifecycle_permissions.sql'));
  await db.exec('DROP TRIGGER fixture_signup ON auth.users; DROP FUNCTION public.fixture_signup()');
  await db.exec(await read('supabase/migrations/20261104040057_account_onboarding_contract.sql'));
  await db.exec(await read('scripts/create_feed_posts_table.sql'));
  await db.exec((await read('scripts/create_community_engagement_tables.sql')).split('-- ┌─────────────────────────────────────────────────────────────────────────────┐\n-- │ 2.')[0]);
  const notificationSql=await read('scripts/create_unified_notifications.sql');
  await db.exec(notificationSql.split('-- HELPER FUNCTION')[0]);
  await db.exec(notificationSql.match(/CREATE OR REPLACE FUNCTION create_notification\([\s\S]*?LANGUAGE plpgsql SECURITY DEFINER;/)[0]);
  await db.exec('GRANT ALL ON public.feed_posts,public.feed_comments,public.feed_likes,public.feed_poll_votes,public.unified_notifications TO anon,authenticated,service_role');
  try { await db.exec(await read('supabase/review-candidates/phase2-community-portal.sql')); } catch(e) { console.error({message:e.message,position:e.position,internalPosition:e.internalPosition,internalQuery:e.internalQuery}); throw e; }
  await t.test('anonymous and forged workspace requests are denied',async()=>{
   await denied(()=>request(null,()=>db.query("SELECT public.community_portal('feed','{}')"),'anon'));
   await denied(()=>feed(1,'doctor'));await denied(()=>feed(1,'content_admin'));
  });
  await t.test('server derives identity and safe authorship',async()=>{
   const result=await rpc(1,'patient','save',{...draft,author_user_id:id(5),author_name:'Fake admin'});publicId=result.id;
   const r=await feed(1,'patient');assert.equal(r.viewer.moderator,false);assert.equal(r.posts[0].authorName,'Patient Alpha');assert.equal(r.posts[0].authorId,id(1));
  });
  await t.test('approved doctors and patients can publish only allowed audiences',async()=>{
   doctorId=(await rpc(4,'doctor','save',{...draft,audience:'doctor'})).id;
   patientId=(await rpc(1,'patient','save',{...draft,audience:'patient'})).id;
   await denied(()=>rpc(1,'patient','save',{...draft,audience:'doctor'}));await denied(()=>rpc(4,'doctor','save',{...draft,audience:'patient'}));
   assert.equal((await feed(4,'doctor',{audience:'doctor'})).posts.length,1);
  });
  await t.test('parent audience fences include comments, likes and votes',async()=>{
   await rpc(4,'doctor','comment',{id:doctorId,body:'A protected doctor reply.'});await rpc(4,'doctor','like',{id:doctorId,liked:true});
   assert.deepEqual((await feed(1,'patient',{id:doctorId})).posts,[]);
   for(const action of ['comments','like','comment','vote','report'])await denied(()=>rpc(1,'patient',action,{id:doctorId,body:'Forged reply',liked:true,option:0,reason:'A forged report reason'}));
   for(const table of ['feed_posts','feed_comments','feed_likes','feed_poll_votes'])assert.equal((await request(1,()=>db.query(`SELECT * FROM public.${table} WHERE ${table==='feed_posts'?'id':'post_id'}=$1`,[doctorId]))).rows.length,0);
  });
  await t.test('browser direct writes cannot bypass the validated API',async()=>{
   await denied(()=>request(1,()=>db.query('UPDATE public.feed_posts SET like_count=999 WHERE id=$1',[publicId])));
   await denied(()=>request(1,()=>db.query('INSERT INTO public.feed_likes(post_id,user_id) VALUES($1,$2)',[doctorId,id(1)])));
   await denied(()=>request(1,()=>db.query('SELECT * FROM public.community_reports')));
  });
  await t.test('likes are idempotent and counts come from persisted records',async()=>{
   await rpc(2,'patient','like',{id:publicId,liked:true});await rpc(2,'patient','like',{id:publicId,liked:true});
   let post=(await feed(2,'patient')).posts.find(p=>p.id===publicId);assert.equal(post.likeCount,1);assert.equal(post.liked,true);
   await rpc(2,'patient','like',{id:publicId,liked:false});post=(await feed(2,'patient')).posts.find(p=>p.id===publicId);assert.equal(post.likeCount,0);
  });
  await t.test('comment ownership and notifications persist without leaking reply text',async()=>{
   await rpc(2,'patient','comment',{id:publicId,body:'A real stored reply from another account.'});
   let comments=(await rpc(2,'patient','comments',{id:publicId})).comments;assert.equal(comments.length,1);assert.equal(comments[0].mine,true);
   const notes=(await rpc(1,'patient','notifications')).notifications;assert.equal(notes.length,1);assert.ok(!notes[0].message.includes('real stored reply'));
   assert.equal((await rpc(2,'patient','notifications')).notifications.length,0);
   await denied(()=>rpc(1,'patient','delete_comment',{id:comments[0].id}));
   await rpc(2,'patient','delete_comment',{id:comments[0].id});assert.equal((await rpc(1,'patient','comments',{id:publicId})).comments.length,0);
   await rpc(1,'patient','notification',{id:notes[0].id,decision:'read'});assert.equal((await rpc(1,'patient','notifications')).notifications[0].isRead,true);
   await rpc(2,'patient','notification',{id:notes[0].id,decision:'dismiss'});assert.equal((await rpc(1,'patient','notifications')).notifications.length,1);
   await rpc(1,'patient','notification',{id:notes[0].id,decision:'dismiss'});assert.equal((await rpc(1,'patient','notifications')).notifications.length,0);
  });
  await t.test('notification payloads and trusted delivery cannot be forged through browser APIs',async()=>{
   await denied(()=>request(1,()=>db.query("UPDATE public.unified_notifications SET title='Forged message' WHERE user_id=$1",[id(1)])));
   await denied(()=>request(1,()=>db.query("SELECT public.create_notification($1,'Forged alert')",[id(2)])));
   await denied(()=>request(1,()=>db.query("INSERT INTO public.unified_notifications(user_id,title) VALUES($1,'Forged alert')",[id(2)])));
  });
  await t.test('a failed notification transaction rolls back a reply and its counter',async()=>{
   await db.exec("CREATE FUNCTION public.fixture_notification_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic delivery persistence failure'; END $$; CREATE TRIGGER fixture_notification_fail BEFORE INSERT ON public.unified_notifications FOR EACH ROW EXECUTE FUNCTION public.fixture_notification_fail()");
   await assert.rejects(()=>rpc(2,'patient','comment',{id:publicId,body:'Must roll back if notification persistence fails.'}),/Synthetic delivery persistence failure/);
   assert.equal((await rpc(1,'patient','comments',{id:publicId})).comments.length,0);
   assert.equal((await feed(1,'patient')).posts.find(p=>p.id===publicId).commentCount,0);
   await db.exec('DROP TRIGGER fixture_notification_fail ON public.unified_notifications; DROP FUNCTION public.fixture_notification_fail()');
  });
  await t.test('selected workspace does not inherit another grant’s restricted conversations',async()=>{
   await db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'patient')",[id(4)]);
   assert.equal((await feed(4,'patient',{id:doctorId})).posts.length,0);
   await denied(()=>rpc(4,'patient','comments',{id:doctorId}));
   const comment=(await rpc(4,'doctor','comments',{id:doctorId})).comments[0];
   await denied(()=>rpc(4,'patient','delete_comment',{id:comment.id}));
  });
  await t.test('content moderation can inspect reported private posts without clinical privileges',async()=>{
   await db.query("INSERT INTO public.user_roles(user_id,role) VALUES($1,'content_admin')",[id(12)]);
   assert.equal((await feed(12,'content_admin',{id:doctorId})).posts[0].id,doctorId);
   assert.equal((await rpc(12,'content_admin','comments',{id:doctorId})).comments.length,1);
   await denied(()=>rpc(11,'doctor_admin','reports'));
  });
  await t.test('editing is owned and audience cannot change after publication',async()=>{
   await denied(()=>rpc(2,'patient','save',{...draft,id:publicId,title:'Stolen title'}));
   await rpc(1,'patient','save',{...draft,id:publicId,title:'Updated owned title'});
   assert.equal((await feed(1,'patient')).posts.find(p=>p.id===publicId).title,'Updated owned title');
   await assert.rejects(()=>rpc(1,'patient','save',{...draft,id:publicId,audience:'patient'}),e=>e.code==='22023');
  });
  await t.test('poll choices and expiry are validated and each account has one vote',async()=>{
   pollId=(await rpc(1,'patient','save',{...draft,kind:'poll',options:['Morning walks','Regular sleep']})).id;
   for(const option of [-1,2,null])await assert.rejects(()=>rpc(2,'patient','vote',{id:pollId,option}),e=>e.code==='22023');
   await rpc(2,'patient','vote',{id:pollId,option:0});await rpc(2,'patient','vote',{id:pollId,option:1});
   const poll=(await feed(2,'patient')).posts.find(p=>p.id===pollId).poll;assert.equal(poll.selected,1);assert.deepEqual(poll.options.map(x=>x.votes),[0,1]);
   await assert.rejects(()=>rpc(1,'patient','save',{...draft,id:pollId,kind:'poll',options:['Changed choice','Regular sleep']}),e=>e.code==='22023');
   await db.query("UPDATE public.feed_posts SET poll_expires_at=now()-interval '1 day' WHERE id=$1",[pollId]);
   await assert.rejects(()=>rpc(2,'patient','vote',{id:pollId,option:0}),e=>e.code==='22023');
   await assert.rejects(()=>rpc(1,'patient','save',{...draft,kind:'poll',options:['Same',' same ']}),e=>e.code==='22023');
  });
  await t.test('reports deduplicate and only canonical moderators can record decisions',async()=>{
   await rpc(2,'patient','report',{id:publicId,reason:'Potentially misleading health claim.'});await rpc(2,'patient','report',{id:publicId,reason:'Repeated submission of the report.'});
   await denied(()=>rpc(2,'patient','reports'));
   const reports=(await rpc(5,'admin','reports')).reports;assert.equal(reports.length,1);
   await denied(()=>rpc(2,'patient','moderate',{id:reports[0].id,decision:'hide',reason:'Unauthorized moderation attempt.'}));
   await rpc(5,'admin','moderate',{id:reports[0].id,decision:'hide',reason:'Content violates community guidance.'});
   assert.equal((await rpc(5,'admin','reports')).reports.length,0);
   assert.equal((await feed(1,'patient',{id:publicId})).posts.length,0);
   await denied(()=>rpc(1,'patient','save',{...draft,id:publicId}));
   assert.equal((await db.query('SELECT count(*)::integer n FROM public.community_moderation_log')).rows[0].n,1);
  });
  await t.test('doctor suspension and role removal immediately revoke restricted access',async()=>{
   await db.query('UPDATE public.doctors SET is_suspended=true WHERE user_id=$1',[id(4)]);
   await denied(()=>feed(4,'doctor',{audience:'doctor'}));await denied(()=>rpc(4,'doctor','comments',{id:doctorId}));
   await db.query('UPDATE public.doctors SET is_suspended=false WHERE user_id=$1',[id(4)]);
   await db.query("DELETE FROM public.user_roles WHERE user_id=$1 AND role='doctor'",[id(4)]);await denied(()=>feed(4,'doctor'));
  });
  await t.test('unknown/deleted actors cannot retain access with an old identity',async()=>{await denied(()=>feed(99,'patient'));await db.query('UPDATE auth.users SET deleted_at=now() WHERE id=$1',[id(3)]);await denied(()=>feed(3,'patient'));});
  await t.test('bounded literal search and stable pagination',async()=>{
   assert.equal((await feed(1,'patient',{query:'%'})).posts.length,0);
   await assert.rejects(()=>feed(1,'patient',{page:0}),e=>e.code==='22023');
   for(let i=0;i<14;i++)await rpc(1,'patient','save',{...draft,title:`Page entry ${i}`});
   const first=await feed(1,'patient');const second=await feed(1,'patient',{page:2});assert.equal(first.posts.length,12);assert.equal(first.hasMore,true);assert.ok(second.posts.length>0);assert.equal(new Set([...first.posts,...second.posts].map(p=>p.id)).size,first.posts.length+second.posts.length);
  });
  await t.test('owned deletion cascades interactions',async()=>{
   await denied(()=>rpc(2,'patient','delete',{id:patientId}));await rpc(1,'patient','delete',{id:patientId});assert.equal((await feed(1,'patient',{audience:'patient'})).posts.length,0);
  });
 }finally{await db.close();}
});
