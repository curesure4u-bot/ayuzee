import{createClient}from'@supabase/supabase-js';
import type{Database}from'@/integrations/supabase/types';
// A real PostgREST builder with an entirely local unavailable transport. It has
// no owning account, session storage, credentials, live project URL or network.
// 501 denotes an unreleased implementation and avoids SDK temporary-error retries.
// Locally verified candidate schemas stay in their existing narrow contracts;
// switching to the live transport requires hosted acceptance in the phase ledger.
const client=createClient<Database>('https://unreleased.invalid','preview-only-no-credentials',{
 accessToken:async()=>null,
 auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
 global:{fetch:async()=>new Response(JSON.stringify({code:'FEATURE_PREVIEW',message:'This backend is not released. Services are unavailable.',details:null,hint:null}),{status:501,headers:{'Content-Type':'application/json'}})},
});
export const previewSupabase=Object.freeze({from:client.from.bind(client),rpc:client.rpc.bind(client)});
