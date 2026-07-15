// Issue developer API keys for the authenticated doctor. Returns the plaintext key ONCE.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Auth required" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const { label } = await req.json();
    if (!label || typeof label !== "string" || label.length < 2)
      return new Response(JSON.stringify({ error: "Label required (min 2 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Generate ayz_<32 hex chars>
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const rand = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const plainKey = `ayz_${rand}`;
    const keyPrefix = plainKey.slice(0, 10);
    const keyHash = await sha256Hex(plainKey);

    const { data, error } = await supabase
      .from("developer_api_keys")
      .insert({
        doctor_user_id: user.id,
        label,
        key_prefix: keyPrefix,
        key_hash: keyHash,
      })
      .select("id, label, key_prefix, scopes, created_at")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ key: plainKey, record: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dev-api-keys error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
