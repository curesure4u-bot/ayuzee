// Shared auth helpers for Lovable Cloud edge functions.
// - requireUser: validates the caller's Supabase JWT and returns the user id.
// - requireInternalSecret: validates an internal shared-secret header for
//   server-to-server / pg_net trigger callers.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function requireUser(
  req: Request,
): Promise<{ userId: string; token: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return unauthorized();
  const token = authHeader.slice(7);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return unauthorized();
  return { userId: data.user.id, token };
}

export function requireInternalSecret(req: Request): Response | null {
  const expected = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  if (!expected) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing INTERNAL_WEBHOOK_SECRET" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const provided = req.headers.get("x-internal-secret");
  if (!provided || provided !== expected) return unauthorized();
  return null;
}
