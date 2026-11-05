import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';

export function localSQL(query){
 const r=spawnSync('docker',['exec','-i','supabase_db_ayuzee-local-staging','psql','-U','postgres','-d','postgres','-At','-v','ON_ERROR_STOP=1'],{input:query,encoding:'utf8',maxBuffer:8*1024*1024});
 if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();
}
export function localConfig(){
 const r=spawnSync('node_modules/.bin/supabase',['--workdir','local-staging','status','-o','json'],{encoding:'utf8',env:{...process.env,DO_NOT_TRACK:'1',SUPABASE_NO_UPDATE_NOTIFIER:'1',SUPABASE_HOME:'/Users/sai/Codex/Ayuzee-Project-Handover/work/phase0-2-2026-11-04/cli-state'}});
 assert.equal(r.status,0,r.stderr);const value=JSON.parse(r.stdout),c=value.result||value;
 const result={api:c.API_URL||c.api_url,key:c.ANON_KEY||c.anon_key,service:c.SERVICE_ROLE_KEY||c.service_role_key};
 assert.equal(new URL(result.api).origin,'http://127.0.0.1:54621');assert.ok(result.key&&result.service);
 return result; // Never log: service key is strictly local and remains in memory.
}
export function localClient(c,{service=false}={}){
 assert.equal(new URL(c.api).origin,'http://127.0.0.1:54621');
 const values=new Map();
 return createClient(c.api,service?c.service:c.key,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,flowType:'pkce',storage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}}});
}
