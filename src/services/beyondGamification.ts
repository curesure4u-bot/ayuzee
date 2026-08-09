/**
 * Beyond.Praxis — Gamification Service
 * Handles XP, streaks, badges, coins, and level-ups.
 * All functions are client-side Supabase calls.
 */

import { supabase } from "@/integrations/supabase/client";

// ════════════════════════════════════════════════════════════
// LEVEL THRESHOLDS
// ════════════════════════════════════════════════════════════

const LEVEL_CONFIG = [
  { level: 1, title: "Intern", threshold: 0 },
  { level: 2, title: "Junior Resident", threshold: 500 },
  { level: 3, title: "Senior Resident", threshold: 1500 },
  { level: 4, title: "Registrar", threshold: 3500 },
  { level: 5, title: "Consultant", threshold: 7000 },
  { level: 6, title: "Associate Professor", threshold: 12000 },
  { level: 7, title: "Professor", threshold: 20000 },
  { level: 8, title: "Department Head", threshold: 35000 },
  { level: 9, title: "Dean", threshold: 55000 },
  { level: 10, title: "Praxis Master", threshold: 80000 },
];

function calculateLevel(totalXp: number) {
  let result = LEVEL_CONFIG[0];
  for (const config of LEVEL_CONFIG) {
    if (totalXp >= config.threshold) {
      result = config;
    } else {
      break;
    }
  }
  const nextLevel = LEVEL_CONFIG.find((c) => c.threshold > totalXp);
  const xpToNext = nextLevel ? nextLevel.threshold - totalXp : 0;
  return { level: result.level, title: result.title, xpToNext };
}

// ════════════════════════════════════════════════════════════
// XP SYSTEM
// ════════════════════════════════════════════════════════════

export async function earnXP(
  userId: string,
  amount: number,
  source: string,
  description?: string,
  sourceId?: string
): Promise<{ newTotal: number; leveledUp: boolean; newLevel?: number; newTitle?: string }> {
  const sb = supabase as any;

  // 1. Get or create XP record
  let { data: xpRow } = await sb
    .from("beyond_user_xp")
    .select("total_xp, current_level")
    .eq("user_id", userId)
    .maybeSingle();

  if (!xpRow) {
    // Initialize XP record
    await sb.from("beyond_user_xp").insert({
      user_id: userId,
      total_xp: 0,
      current_level: 1,
      level_title: "Intern",
      xp_to_next_level: 500,
    });
    xpRow = { total_xp: 0, current_level: 1 };
  }

  const newTotal = xpRow.total_xp + amount;
  const { level, title, xpToNext } = calculateLevel(newTotal);
  const leveledUp = level > xpRow.current_level;

  // 2. Update XP record
  await sb
    .from("beyond_user_xp")
    .update({
      total_xp: newTotal,
      current_level: level,
      level_title: title,
      xp_to_next_level: xpToNext,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // 3. Log transaction
  await sb.from("beyond_xp_transactions").insert({
    user_id: userId,
    amount,
    source,
    source_id: sourceId || null,
    description: description || `Earned ${amount} XP from ${source}`,
  });

  // 4. Update weekly leaderboard
  const weekStart = getWeekStart();
  const { data: leaderEntry } = await sb
    .from("beyond_leaderboard_weekly")
    .select("id, xp_this_week")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (leaderEntry) {
    await sb
      .from("beyond_leaderboard_weekly")
      .update({ xp_this_week: leaderEntry.xp_this_week + amount, updated_at: new Date().toISOString() })
      .eq("id", leaderEntry.id);
  } else {
    await sb.from("beyond_leaderboard_weekly").insert({
      user_id: userId,
      xp_this_week: amount,
      week_start: weekStart,
    });
  }

  // 5. If leveled up, create notification
  if (leveledUp) {
    await sb.from("beyond_notifications").insert({
      user_id: userId,
      type: "level_up",
      title: `Level Up! You're now Level ${level}`,
      message: `Congratulations! You've reached "${title}". Keep growing!`,
      action_url: "/beyond",
    });
  }

  return { newTotal, leveledUp, newLevel: leveledUp ? level : undefined, newTitle: leveledUp ? title : undefined };
}

// ════════════════════════════════════════════════════════════
// STREAKS
// ════════════════════════════════════════════════════════════

export type StreakType = "daily_login" | "learning" | "wellness" | "planning" | "reading" | "reflection" | "finance";

export async function updateStreak(
  userId: string,
  streakType: StreakType
): Promise<{ currentCount: number; isNew: boolean; milestoneHit?: number }> {
  const sb = supabase as any;

  const { data: streak } = await sb
    .from("beyond_streaks")
    .select("*")
    .eq("user_id", userId)
    .eq("streak_type", streakType)
    .maybeSingle();

  const now = new Date();

  if (!streak) {
    // Create new streak
    await sb.from("beyond_streaks").insert({
      user_id: userId,
      streak_type: streakType,
      current_count: 1,
      longest_count: 1,
      last_activity_at: now.toISOString(),
    });

    return { currentCount: 1, isNew: true };
  }

  // Check if already counted today
  const lastActivity = new Date(streak.last_activity_at);
  if (isSameDay(lastActivity, now)) {
    return { currentCount: streak.current_count, isNew: false };
  }

  // Check if streak continues (activity was yesterday) or breaks
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const continues = isSameDay(lastActivity, yesterday);

  const newCount = continues ? streak.current_count + 1 : 1;
  const newLongest = Math.max(streak.longest_count, newCount);

  await sb
    .from("beyond_streaks")
    .update({
      current_count: newCount,
      longest_count: newLongest,
      last_activity_at: now.toISOString(),
    })
    .eq("id", streak.id);

  // Check for streak milestones (7, 14, 30, 60, 100)
  const milestones = [7, 14, 30, 60, 100];
  const milestoneHit = milestones.find((m) => newCount === m);

  if (milestoneHit) {
    // Award bonus XP for milestone
    const bonusXp = milestoneHit === 7 ? 100 : milestoneHit === 14 ? 150 : milestoneHit === 30 ? 500 : milestoneHit === 60 ? 750 : 1000;
    await earnXP(userId, bonusXp, "streak_milestone", `${milestoneHit}-day ${streakType} streak bonus!`);

    // Award bonus coins
    await earnCoins(userId, Math.round(bonusXp / 2), "streak_milestone", `${milestoneHit}-day streak reward`);
  }

  return { currentCount: newCount, isNew: false, milestoneHit };
}

// ════════════════════════════════════════════════════════════
// BADGES
// ════════════════════════════════════════════════════════════

export async function awardBadge(
  userId: string,
  badgeName: string
): Promise<{ awarded: boolean; alreadyHad: boolean }> {
  const sb = supabase as any;

  // Find badge in catalog
  const { data: badge } = await sb
    .from("beyond_badges_catalog")
    .select("id, name, xp_reward, coin_reward")
    .eq("name", badgeName)
    .maybeSingle();

  if (!badge) return { awarded: false, alreadyHad: false };

  // Check if already earned
  const { data: existing } = await sb
    .from("beyond_user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badge.id)
    .maybeSingle();

  if (existing) return { awarded: false, alreadyHad: true };

  // Award badge
  await sb.from("beyond_user_badges").insert({
    user_id: userId,
    badge_id: badge.id,
  });

  // Award associated XP and coins
  if (badge.xp_reward > 0) {
    await earnXP(userId, badge.xp_reward, "badge_earned", `Badge earned: ${badge.name}`);
  }
  if (badge.coin_reward > 0) {
    await earnCoins(userId, badge.coin_reward, "badge_earned", `Badge reward: ${badge.name}`);
  }

  // Notification
  await sb.from("beyond_notifications").insert({
    user_id: userId,
    type: "badge_earned",
    title: `Badge Earned: ${badge.name}`,
    message: `Congratulations! You earned the "${badge.name}" badge.`,
    action_url: "/beyond/badges",
  });

  return { awarded: true, alreadyHad: false };
}

/**
 * Check and award badges based on current state.
 * Call this after key actions (wheel save, streak update, etc.)
 */
export async function checkAndAwardBadges(userId: string, context: {
  action: string;
  wheelAssessmentCount?: number;
  streakType?: string;
  streakCount?: number;
  allWheelAbove?: number;
}) {
  const { action, wheelAssessmentCount, streakType, streakCount, allWheelAbove } = context;

  // Mirror Mirror: First wheel assessment
  if (action === "wheel_assessment" && wheelAssessmentCount === 1) {
    await awardBadge(userId, "Mirror Mirror");
  }

  // Balanced Life: All spokes >= 6
  if (action === "wheel_assessment" && allWheelAbove && allWheelAbove >= 6) {
    await awardBadge(userId, "Balanced Life");
  }

  // Marathon Mind: 30-day learning streak
  if (streakType === "learning" && streakCount && streakCount >= 30) {
    await awardBadge(userId, "Marathon Mind");
  }

  // Wellness Warrior: 30-day wellness streak
  if (streakType === "wellness" && streakCount && streakCount >= 30) {
    await awardBadge(userId, "Wellness Warrior");
  }

  // Centurion: 100-day streak of any type
  if (streakCount && streakCount >= 100) {
    await awardBadge(userId, "Centurion");
  }
}

// ════════════════════════════════════════════════════════════
// COINS
// ════════════════════════════════════════════════════════════

export async function earnCoins(
  userId: string,
  amount: number,
  source: string,
  description?: string
): Promise<number> {
  const sb = supabase as any;

  // Get or create coin balance
  let { data: coinRow } = await sb
    .from("beyond_coin_balance")
    .select("balance, lifetime_earned")
    .eq("user_id", userId)
    .maybeSingle();

  if (!coinRow) {
    await sb.from("beyond_coin_balance").insert({
      user_id: userId,
      balance: amount,
      lifetime_earned: amount,
      lifetime_spent: 0,
    });
    coinRow = { balance: amount, lifetime_earned: amount };
  } else {
    await sb
      .from("beyond_coin_balance")
      .update({
        balance: coinRow.balance + amount,
        lifetime_earned: coinRow.lifetime_earned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    coinRow.balance += amount;
  }

  // Log transaction
  await sb.from("beyond_coin_transactions").insert({
    user_id: userId,
    amount,
    type: "earn",
    source,
    description: description || `Earned ${amount} coins`,
  });

  return coinRow.balance;
}

export async function spendCoins(
  userId: string,
  amount: number,
  source: string,
  description?: string
): Promise<{ success: boolean; newBalance: number }> {
  const sb = supabase as any;

  const { data: coinRow } = await sb
    .from("beyond_coin_balance")
    .select("balance, lifetime_spent")
    .eq("user_id", userId)
    .maybeSingle();

  if (!coinRow || coinRow.balance < amount) {
    return { success: false, newBalance: coinRow?.balance || 0 };
  }

  await sb
    .from("beyond_coin_balance")
    .update({
      balance: coinRow.balance - amount,
      lifetime_spent: coinRow.lifetime_spent + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await sb.from("beyond_coin_transactions").insert({
    user_id: userId,
    amount,
    type: "spend",
    source,
    description: description || `Spent ${amount} coins`,
  });

  return { success: true, newBalance: coinRow.balance - amount };
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}
