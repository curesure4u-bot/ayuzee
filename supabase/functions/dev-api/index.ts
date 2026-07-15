// Developer read-only REST API for partners.
// Auth: header `x-api-key: ayz_xxx`. Routes:
//   GET /dev-api/patients
//   GET /dev-api/consultations
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type",
};

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return new Response(JSON.stringify({ error: "x-api-key required" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const keyHash = await sha256Hex(apiKey);
    const { data: keyRow } = await supabase
      .from("developer_api_keys")
      .select("id, doctor_user_id, scopes, revoked")
      .eq("key_hash", keyHash)
      .maybeSingle();

    if (!keyRow || keyRow.revoked)
      return new Response(JSON.stringify({ error: "Invalid or revoked API key" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    await supabase.from("developer_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id);

    const url = new URL(req.url);
    const path = url.pathname.replace(/^.*\/dev-api/, "");
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);

    if (path === "/patients" || path === "/patients/") {
      if (!keyRow.scopes.includes("read:patients"))
        return new Response(JSON.stringify({ error: "scope read:patients required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const { data, error } = await supabase
        .from("vaidya_patients")
        .select("id, full_name, phone, age, gender, created_at")
        .eq("doctor_user_id", keyRow.doctor_user_id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path === "/consultations" || path === "/consultations/") {
      if (!keyRow.scopes.includes("read:consultations"))
        return new Response(JSON.stringify({ error: "scope read:consultations required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const { data, error } = await supabase
        .from("vaidya_consultations")
        .select("id, patient_id, visit_date, chief_complaint, assessment, prescription, follow_up_date, fee, created_at")
        .eq("doctor_user_id", keyRow.doctor_user_id)
        .order("visit_date", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return new Response(JSON.stringify({ data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown path", available: ["/patients", "/consultations"] }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dev-api error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
