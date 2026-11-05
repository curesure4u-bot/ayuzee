import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectSource,schemaNames} from './schema-contracts.mjs';
const schema=schemaNames('export type Database={public:{Tables:{profiles:{Row:{user_id:string}}};Views:{public_directory:{Row:{id:string}}};Functions:{get_account_onboarding:{Args:never}}}}');
test('catalog preflight distinguishes public tables/views/RPCs from storage and comments',()=>{
 const r=inspectSource(`import {supabase} from '@/integrations/supabase/client';
 supabase.from('profiles').select('*'); supabase.from('public_directory');
 supabase.rpc('get_account_onboarding'); supabase.storage.from('private-bucket');
 // supabase.from('not-code');
 const message="supabase.from('not-a-call')";
 `,'page.ts',schema);assert.deepEqual(r.issues,[]);
});
test('casted/aliased missing objects fail even where any would hide SDK type errors',()=>{
 const r=inspectSource(`import {supabase as db} from '@/integrations/supabase/client';
 const alias=db as any; (alias as any).from('absent_table').select('*');
 db.rpc('absent_rpc');
 `,'page.tsx',schema);assert.deepEqual(r.issues.map(x=>[x.kind,x.object]),[['missing-relation','absent_table'],['missing-rpc','absent_rpc']]);
});
test('dynamic references are recorded without inventing a schema or declaring success',()=>{
 const r=inspectSource("import {supabase} from '@/integrations/supabase/client'; supabase.from(name);",'page.ts',schema);
 assert.deepEqual(r.issues,[]);assert.equal(r.dynamic.length,1);assert.equal(r.dynamic[0].kind,'dynamic-reference-needs-review');
});
test('shadowed local clients are not mistaken for the imported project client',()=>{
 const r=inspectSource(`import {supabase} from '@/integrations/supabase/client';
 function local(supabase:any){supabase.from('fixture_only');}
 const db=supabase;
 function other(){const db={from:(s:string)=>s};db.from('memory_store');}
 db.from('profiles');
 `,'page.ts',schema);assert.deepEqual(r.issues,[]);
});
