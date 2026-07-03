// Shared auth helpers for Supabase edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "./cors.ts";

export { getCorsHeaders, handleCorsPreflight } from "./cors.ts";

function unauthorized(req: Request, message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

export async function requireUser(
  req: Request,
): Promise<{ userId: string; token: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return unauthorized(req);
  const token = authHeader.slice(7);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return unauthorized(req);
  return { userId: data.user.id, token };
}

export function requireInternalSecret(req: Request): Response | null {
  const expected = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
  if (!expected) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: missing INTERNAL_WEBHOOK_SECRET" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }
  const provided = req.headers.get("x-internal-secret");
  if (!provided || provided !== expected) return unauthorized(req);
  return null;
}
