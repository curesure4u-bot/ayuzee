// 🎮 Ayuzee Gamification - Badge Check Edge Function
// This function is called after key events to check if user earned new badges
// Triggered by: consultation_complete, prescription_created, login, review_posted, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface BadgeCheckEvent {
  user_id: string;
  role: string;
  event_type: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  try {
    const { user_id, role, event_type, metadata } = await req.json() as BadgeCheckEvent;

    if (!user_id || !role || !event_type) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Get user's current stats
    const { data: coins } = await supabase
      .from("user_coins")
      .select("total_coins, total_points")
      .eq("user_id", user_id)
      .eq("role", role)
      .maybeSingle();

    const { data: badges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user_id);

    const earnedIds = (badges || []).map((b: any) => b.badge_id);

    // Badge condition checks based on event type
    const newBadges: string[] = [];

    // Example checks (expand based on event_type)
    if (event_type === "consultation_complete") {
      // Check consultation count
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("doctor_id", user_id)
        .eq("status", "completed");

      if (count && count >= 100 && !earnedIds.includes("dr-100-consults")) {
        newBadges.push("dr-100-consults");
      }
    }

    if (event_type === "login" && role === "doctor") {
      const { data: streak } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", user_id)
        .eq("streak_type", "daily_login")
        .maybeSingle();

      if (streak?.current_streak >= 7 && !earnedIds.includes("dr-week-warrior")) {
        newBadges.push("dr-week-warrior");
      }
      if (streak?.current_streak >= 30 && !earnedIds.includes("dr-month-master")) {
        newBadges.push("dr-month-master");
      }
    }

    // Award new badges
    for (const badgeId of newBadges) {
      await supabase.from("user_badges").insert({
        user_id,
        badge_id: badgeId,
        role,
        points_awarded: 0, // Points are in the config
        coins_awarded: 0,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      new_badges: newBadges,
      checked_event: event_type,
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
