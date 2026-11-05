import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectSource,schemaNames,listSourceFiles} from './schema-contracts.mjs';
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

// The GitHub runner that exposed this regression had no rg executable.
// Missing optional tooling must not hide the actual schema diagnostics.
test('source discovery falls back to Node when ripgrep is missing',async()=>{
 const {mkdtempSync,mkdirSync,writeFileSync,rmSync,symlinkSync}=await import('node:fs');
 const {fileURLToPath}=await import('node:url');const {join}=await import('node:path');
 const dir=mkdtempSync(fileURLToPath(new URL('../tests/.schema-discovery-',import.meta.url)));
 try{mkdirSync(join(dir,'nested'));mkdirSync(join(dir,'.private'));mkdirSync(join(dir,'node_modules'));
  for(const file of ['first.ts','nested/page.tsx','nested/types.ts','types.ts','image.svg','.private/secret.ts','node_modules/library.ts'])writeFileSync(join(dir,file),'');
  symlinkSync(join(dir,'first.ts'),join(dir,'alias.ts'));
  const missing=()=>{throw Object.assign(Error('Not installed'),{code:'ENOENT'});};
  assert.deepEqual(listSourceFiles(dir,missing),['first.ts','nested/page.tsx']);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('ripgrep discovery uses the same deterministic source filters',()=>{
 assert.deepEqual(listSourceFiles('/unused',()=> './z.tsx\n./nested/types.ts\n./types.ts\n./a.ts\n./image.png\n'),['a.ts','z.tsx']);
});
test('source discovery does not hide permission or execution failures',()=>{
 assert.throws(()=>listSourceFiles('/unused',()=>{throw Object.assign(Error('Denied'),{code:'EACCES'});}),/Denied/);
});
