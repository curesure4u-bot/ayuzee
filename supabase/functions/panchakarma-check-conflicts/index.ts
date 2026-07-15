// Checks proposed Panchakarma session slots against existing bookings and appointments.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Slot = {
  index: number;                    // caller-provided identifier (e.g. stage sort_order)
  scheduled_date: string;           // YYYY-MM-DD
  scheduled_time: string | null;    // HH:MM or HH:MM:SS
  duration_minutes: number | null;
  room_resource: string | null;
};

type Body = { vaidya_id: string; slots: Slot[] };

// Overlap check on the same date. If either side lacks a time we treat it
// as an all-day soft conflict (same date + same vaidya/room => conflict).
function overlaps(aStart: string | null, aDur: number | null, bStart: string | null, bDur: number | null) {
  if (!aStart || !bStart) return true;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0);
  };
  const aS = toMin(aStart), aE = aS + (aDur ?? 60);
  const bS = toMin(bStart), bE = bS + (bDur ?? 60);
  return aS < bE && bS < aE;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { vaidya_id, slots } = (await req.json()) as Body;
    if (!vaidya_id || !Array.isArray(slots) || slots.length === 0) {
      return new Response(JSON.stringify({ error: "vaidya_id and slots[] required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const dates = [...new Set(slots.map(s => s.scheduled_date))];
    const rooms = [...new Set(slots.map(s => s.room_resource).filter(Boolean) as string[])];

    // Existing panchakarma sessions on those dates (same vaidya or same room)
    let sessQuery = supabase
      .from("panchakarma_sessions")
      .select("scheduled_date, scheduled_time, room_resource, vaidya_id, status")
      .in("scheduled_date", dates)
      .neq("status", "missed")
      .neq("status", "rescheduled");
    const { data: sessions, error: sErr } = await sessQuery;
    if (sErr) throw sErr;

    // Existing appointments on those dates for this vaidya's doctor row
    const { data: docRow } = await supabase
      .from("doctors").select("id").eq("user_id", vaidya_id).maybeSingle();

    let appts: { appointment_date: string; time_slot: string }[] = [];
    if (docRow?.id) {
      const { data } = await supabase
        .from("appointments")
        .select("appointment_date, time_slot, status")
        .eq("doctor_id", docRow.id)
        .in("appointment_date", dates);
      appts = (data ?? []).filter(a => !["cancelled", "no_show"].includes((a as any).status));
    }

    const conflicts = slots.map((slot) => {
      const reasons: string[] = [];

      // Panchakarma sessions
      for (const s of sessions ?? []) {
        if (s.scheduled_date !== slot.scheduled_date) continue;
        const sameVaidya = s.vaidya_id === vaidya_id;
        const sameRoom = slot.room_resource && s.room_resource && s.room_resource === slot.room_resource;
        if (!sameVaidya && !sameRoom) continue;
        if (overlaps(slot.scheduled_time, slot.duration_minutes, s.scheduled_time, null)) {
          if (sameVaidya) reasons.push(`Vaidya already has a Panchakarma session at ${s.scheduled_time ?? "this time"}`);
          if (sameRoom) reasons.push(`Room "${slot.room_resource}" is booked at ${s.scheduled_time ?? "this time"}`);
        }
      }

      // Appointments (parse time_slot like "10:00-10:30" or "10:00")
      for (const a of appts) {
        if (a.appointment_date !== slot.scheduled_date) continue;
        const start = (a.time_slot || "").split("-")[0].trim() || null;
        if (overlaps(slot.scheduled_time, slot.duration_minutes, start, 30)) {
          reasons.push(`Vaidya has an appointment at ${a.time_slot}`);
        }
      }

      return { index: slot.index, scheduled_date: slot.scheduled_date, conflicts: [...new Set(reasons)] };
    });

    return new Response(
      JSON.stringify({ ok: true, conflicts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
