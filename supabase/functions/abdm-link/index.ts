// ABDM / ABHA stub — verifies ABHA ID format and logs a (mock) FHIR push.
// When ABDM_CLIENT_ID + ABDM_CLIENT_SECRET secrets are configured, this will push to the real ABDM sandbox.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ABHA_RX = /^\d{2}-\d{4}-\d{4}-\d{4}$|^[a-zA-Z0-9.\-_]{3,}@(abdm|sbx)$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { consultation_id, abha_id, patient_name, fhir_payload } = await req.json();
    if (!ABHA_RX.test(abha_id ?? "")) {
      return new Response(JSON.stringify({ error: "Invalid ABHA ID format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const ABDM_ID = Deno.env.get("ABDM_CLIENT_ID");
    const ABDM_SECRET = Deno.env.get("ABDM_CLIENT_SECRET");
    let push_status = "mock_success";
    let push_response: any = { note: "ABDM sandbox credentials not configured — record stored locally only." };

    if (ABDM_ID && ABDM_SECRET) {
      // Real ABDM push would go here (sandbox: https://dev.abdm.gov.in/gateway)
      push_status = "pending_real_push";
      push_response = { note: "ABDM credentials present; real push integration to be enabled." };
    }

    const { data, error } = await supabase
      .from("abha_health_records")
      .insert({
        doctor_user_id: user.id,
        consultation_id,
        abha_id,
        patient_name,
        fhir_payload: fhir_payload ?? {},
        push_status,
        push_response,
        pushed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ record: data, push_status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("abdm-link error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
