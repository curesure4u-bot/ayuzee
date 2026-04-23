// Stub WhatsApp notification — logs payload only.
// Wire to a real provider (Twilio / Gupshup / Meta Cloud API) later.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { to, message, template, params } = body ?? {};
    if (!to || (!message && !template)) {
      return new Response(JSON.stringify({ error: "to and (message|template) required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: integrate with Twilio/Gupshup/Meta. For now, log and return ok.
    console.log("[send-whatsapp]", JSON.stringify({ to, template, params, message }));

    return new Response(JSON.stringify({ ok: true, simulated: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-whatsapp error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
