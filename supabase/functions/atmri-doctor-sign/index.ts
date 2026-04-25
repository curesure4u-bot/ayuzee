import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { case_id, consultation_fee } = await req.json();
    if (!case_id) {
      return new Response(JSON.stringify({ error: "case_id is required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await sb.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const sbAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: doctor } = await sbAdmin
      .from("doctors")
      .select("id,full_name,registration_number,is_verified,consultation_fee,specialization")
      .eq("user_id", userId)
      .maybeSingle();

    if (!doctor?.is_verified) {
      return new Response(JSON.stringify({ error: "Only verified doctors can sign" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { data: caseData } = await sbAdmin
      .from("atmri_sponsored_cases")
      .select("patient_name,condition_name,treatment_plan")
      .eq("id", case_id)
      .maybeSingle();

    if (!caseData) {
      return new Response(JSON.stringify({ error: "Case not found" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const legalDeclaration = `I, Dr. ${doctor.full_name} (Registration No: ${doctor.registration_number}), solemnly declare that I have personally examined ${caseData.patient_name} and confirm: (1) The stated condition (${caseData.condition_name}) is clinically verified by me. (2) The recommended treatment (${caseData.treatment_plan}) is medically indicated. (3) I endorse this case for ATMRI Trust sponsored free treatment. This is a legal declaration under the Indian Medical Council Act.`;

    await sbAdmin.from("atmri_doctor_signatures").insert({
      case_id,
      doctor_id: doctor.id,
      doctor_user_id: userId,
      legal_declaration: legalDeclaration,
      doctor_registration_number: doctor.registration_number,
    });

    await sbAdmin
      .from("atmri_sponsored_cases")
      .update({
        checkpoint_doctor_signed: true,
        doctor_countersigned: true,
        doctor_signed_at: new Date().toISOString(),
        doctor_legal_declaration_accepted: true,
      })
      .eq("id", case_id);

    const feeValue = Number(consultation_fee) || Number(doctor.consultation_fee) || 500;

    const { data: pledge } = await sbAdmin
      .from("doctor_charity_pledges")
      .select("id,used_this_month,total_consultations_donated,total_fee_value_donated")
      .eq("doctor_id", doctor.id)
      .maybeSingle();

    if (pledge) {
      await sbAdmin
        .from("doctor_charity_pledges")
        .update({
          used_this_month: (pledge.used_this_month || 0) + 1,
          total_consultations_donated: (pledge.total_consultations_donated || 0) + 1,
          total_fee_value_donated: Number(pledge.total_fee_value_donated || 0) + feeValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pledge.id);
    }

    await sbAdmin.from("atmri_case_updates").insert({
      case_id,
      update_type: "doctor_assigned",
      is_public: true,
      update_text: `Dr. ${doctor.full_name} (${doctor.specialization || "AYUSH Doctor"}) has joined this case and signed the medical declaration.`,
      posted_by: userId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        signed_by: doctor.full_name,
        signed_at: new Date().toISOString(),
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("atmri-doctor-sign error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
