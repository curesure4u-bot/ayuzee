/**
 * Beyond.Praxis — Cross-Module Data Aggregation Service
 * 
 * This service pulls activity data from ALL Beyond Praxis modules,
 * maps each to the relevant Wheel of Life spoke, and produces a unified
 * "module health" snapshot that powers the interconnected dashboard.
 * 
 * SPOKE MAPPING:
 * - clinical  → Leadership Lab, Guided Pathways, Micro-Learning, AI Companion
 * - finance   → Finance Toolkit, Side Income, Coin transactions
 * - time      → Time Management (Pomodoro), Life Planner tasks, Energy Logs
 * - leadership → Leadership Lab scenarios, Teaching Toolkit, Community posts
 * - relationships → Community engagement, Study Groups, Mentorship
 * - family    → Life Planner (family goals), Gratitude entries, Journal
 * - wellness  → Wellness Hub (breathing, mood, gratitude), Habit Tracker
 * - joy       → Books, Hobbies, Challenges completed, Journal reflections
 */

import { supabase } from "@/integrations/supabase/client";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export type SpokeKey = "clinical" | "finance" | "time" | "leadership" | "relationships" | "family" | "wellness" | "joy";

export interface ModuleActivity {
  module: string;
  spoke: SpokeKey;
  count: number;
  lastActivity: string | null;
  label: string;
  route: string;
}

export interface SpokeHealth {
  spoke: SpokeKey;
  label: string;
  wheelScore: number;         // Latest wheel assessment score (1-10)
  activityScore: number;      // Computed from recent module activity (0-10)
  combinedScore: number;      // Weighted blend: 60% wheel + 40% activity
  trend: "up" | "down" | "stable";
  moduleActivities: ModuleActivity[];
  totalActions7d: number;     // Actions in last 7 days
}

export interface CrossModuleSnapshot {
  spokes: SpokeHealth[];
  overallHealth: number;            // Average of all combined scores
  weakestSpokes: SpokeHealth[];     // Spokes with combined score <= 4
  strongestSpokes: SpokeHealth[];   // Spokes with combined score >= 8
  totalActions7d: number;           // All actions across all modules in 7 days
  totalActions30d: number;          // All actions across all modules in 30 days
  lastAssessmentDate: string | null;
  daysSinceAssessment: number | null;
  activeModuleCount: number;        // Modules with activity in last 7 days
}

// ════════════════════════════════════════════════════════════
// SPOKE CONFIGURATION
// ════════════════════════════════════════════════════════════

const SPOKE_LABELS: Record<SpokeKey, string> = {
  clinical: "Clinical Excellence",
  finance: "Finance & Wealth",
  time: "Time & Productivity",
  leadership: "Leadership & Influence",
  relationships: "Relationships & Social",
  family: "Family & Presence",
  wellness: "Health & Wellness",
  joy: "Joy & Hobbies",
};

// ════════════════════════════════════════════════════════════
// MAIN AGGREGATION FUNCTION
// ════════════════════════════════════════════════════════════

export async function fetchCrossModuleSnapshot(userId: string): Promise<CrossModuleSnapshot> {
  const sb = supabase as any;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // ─── Parallel data fetches ────────────────────────────────────────────────
  const [
    wheelLatest,
    wheelPrevious,
    pomodoroCount7d,
    pomodoroCount30d,
    financeCount7d,
    financeCount30d,
    moodCount7d,
    breathingCount7d,
    gratitudeCount7d,
    habitLogsCount7d,
    journalCount7d,
    journalCount30d,
    booksReading,
    booksFinished,
    lessonCount7d,
    leadershipCount7d,
    communityCount7d,
    todayTasksDone7d,
    challengesCompleted,
    pathwayEnrollments,
  ] = await Promise.all([
    // Wheel assessments (latest + previous)
    sb.from("beyond_wheel_assessments").select("*").eq("user_id", userId).order("assessed_at", { ascending: false }).limit(1),
    sb.from("beyond_wheel_assessments").select("*").eq("user_id", userId).order("assessed_at", { ascending: false }).range(1, 1),

    // Time Management — Pomodoro sessions
    sb.from("beyond_pomodoro_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("started_at", sevenDaysAgo),
    sb.from("beyond_pomodoro_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("started_at", thirtyDaysAgo),

    // Finance — entries
    sb.from("beyond_finance_entries").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("date", sevenDaysAgo.split("T")[0]),
    sb.from("beyond_finance_entries").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("date", thirtyDaysAgo.split("T")[0]),

    // Wellness — mood logs
    sb.from("beyond_mood_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sevenDaysAgo),

    // Wellness — breathing sessions
    sb.from("beyond_breathing_sessions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sevenDaysAgo),

    // Wellness — gratitude entries
    sb.from("beyond_gratitude_entries").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sevenDaysAgo),

    // Habits — logs in last 7 days
    sb.from("beyond_habit_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("date", sevenDaysAgo.split("T")[0]),

    // Journal — entries
    sb.from("beyond_journal_entries").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sevenDaysAgo),
    sb.from("beyond_journal_entries").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", thirtyDaysAgo),

    // Books — currently reading
    sb.from("beyond_reading_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "reading"),

    // Books — finished
    sb.from("beyond_reading_logs").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "finished"),

    // Lessons completed (clinical/pathways)
    sb.from("beyond_lesson_completions").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("completed_at", sevenDaysAgo),

    // Leadership scenarios completed
    sb.from("beyond_leadership_progress").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sevenDaysAgo),

    // Community — posts
    sb.from("beyond_community_posts").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sevenDaysAgo),

    // Today tasks done
    sb.from("beyond_today_tasks").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_done", true).gte("date", sevenDaysAgo.split("T")[0]),

    // Challenges completed
    sb.from("beyond_user_challenges").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),

    // Pathway enrollments (active)
    sb.from("beyond_pathway_enrollments").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
  ]);

  // ─── Extract counts safely ────────────────────────────────────────────────
  const safe = (res: any) => res?.count || 0;
  const latestWheel = wheelLatest?.data?.[0] || null;
  const prevWheel = wheelPrevious?.data?.[0] || null;

  // ─── Build module activities ──────────────────────────────────────────────
  const moduleActivities: ModuleActivity[] = [
    { module: "pomodoro", spoke: "time", count: safe(pomodoroCount7d), lastActivity: null, label: "Pomodoro Sessions", route: "/beyond/time-management" },
    { module: "today_tasks", spoke: "time", count: safe(todayTasksDone7d), lastActivity: null, label: "Tasks Completed", route: "/beyond/planner" },
    { module: "finance", spoke: "finance", count: safe(financeCount7d), lastActivity: null, label: "Finance Entries", route: "/beyond/finance" },
    { module: "mood", spoke: "wellness", count: safe(moodCount7d), lastActivity: null, label: "Mood Check-ins", route: "/beyond/wellness" },
    { module: "breathing", spoke: "wellness", count: safe(breathingCount7d), lastActivity: null, label: "Breathing Sessions", route: "/beyond/wellness" },
    { module: "gratitude", spoke: "family", count: safe(gratitudeCount7d), lastActivity: null, label: "Gratitude Entries", route: "/beyond/wellness" },
    { module: "habits", spoke: "wellness", count: safe(habitLogsCount7d), lastActivity: null, label: "Habit Check-ins", route: "/beyond/habits" },
    { module: "journal", spoke: "joy", count: safe(journalCount7d), lastActivity: null, label: "Journal Entries", route: "/beyond/journal" },
    { module: "books_reading", spoke: "joy", count: safe(booksReading), lastActivity: null, label: "Books in Progress", route: "/beyond/books" },
    { module: "books_finished", spoke: "clinical", count: safe(booksFinished), lastActivity: null, label: "Books Completed", route: "/beyond/books" },
    { module: "lessons", spoke: "clinical", count: safe(lessonCount7d), lastActivity: null, label: "Lessons Completed", route: "/beyond/pathways" },
    { module: "leadership", spoke: "leadership", count: safe(leadershipCount7d), lastActivity: null, label: "Leadership Scenarios", route: "/beyond/leadership" },
    { module: "community", spoke: "relationships", count: safe(communityCount7d), lastActivity: null, label: "Community Posts", route: "/beyond/community" },
    { module: "challenges", spoke: "joy", count: safe(challengesCompleted), lastActivity: null, label: "Challenges Won", route: "/beyond/challenges" },
    { module: "pathways", spoke: "clinical", count: safe(pathwayEnrollments), lastActivity: null, label: "Active Pathways", route: "/beyond/pathways" },
  ];

  // ─── Compute spoke health ─────────────────────────────────────────────────
  const spokeKeys: SpokeKey[] = ["clinical", "finance", "time", "leadership", "relationships", "family", "wellness", "joy"];

  const spokes: SpokeHealth[] = spokeKeys.map((spoke) => {
    const wheelScore = latestWheel ? (latestWheel[`${spoke}_score`] as number) : 5;
    const prevScore = prevWheel ? (prevWheel[`${spoke}_score`] as number) : wheelScore;

    // Get all module activities for this spoke
    const spokeActivities = moduleActivities.filter((m) => m.spoke === spoke);
    const totalActions7d = spokeActivities.reduce((sum, m) => sum + m.count, 0);

    // Activity score: map total actions to 0-10 (logarithmic scale)
    // 0 actions = 0, 1 action = 3, 3 actions = 5, 7 actions = 7, 14+ = 9, 21+ = 10
    const activityScore = computeActivityScore(totalActions7d);

    // Combined: 60% wheel self-assessment + 40% actual behavior
    const combinedScore = Math.round((wheelScore * 0.6 + activityScore * 0.4) * 10) / 10;

    // Trend: compare to previous assessment
    const trend: "up" | "down" | "stable" =
      wheelScore > prevScore ? "up" : wheelScore < prevScore ? "down" : "stable";

    return {
      spoke,
      label: SPOKE_LABELS[spoke],
      wheelScore,
      activityScore,
      combinedScore,
      trend,
      moduleActivities: spokeActivities,
      totalActions7d,
    };
  });

  // ─── Compute summary metrics ──────────────────────────────────────────────
  const overallHealth = Math.round((spokes.reduce((sum, s) => sum + s.combinedScore, 0) / spokes.length) * 10) / 10;
  const weakestSpokes = spokes.filter((s) => s.combinedScore <= 4).sort((a, b) => a.combinedScore - b.combinedScore);
  const strongestSpokes = spokes.filter((s) => s.combinedScore >= 7.5).sort((a, b) => b.combinedScore - a.combinedScore);

  const totalActions7d = moduleActivities.reduce((sum, m) => sum + m.count, 0);
  const totalActions30d = safe(pomodoroCount30d) + safe(financeCount30d) + safe(journalCount30d) + safe(booksFinished) + safe(challengesCompleted);
  const activeModuleCount = new Set(moduleActivities.filter((m) => m.count > 0).map((m) => m.module)).size;

  // Assessment recency
  const lastAssessmentDate = latestWheel?.assessed_at || null;
  const daysSinceAssessment = lastAssessmentDate
    ? Math.floor((now.getTime() - new Date(lastAssessmentDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    spokes,
    overallHealth,
    weakestSpokes,
    strongestSpokes,
    totalActions7d,
    totalActions30d,
    lastAssessmentDate,
    daysSinceAssessment,
    activeModuleCount,
  };
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function computeActivityScore(actions: number): number {
  if (actions === 0) return 0;
  if (actions === 1) return 3;
  if (actions <= 3) return 5;
  if (actions <= 7) return 7;
  if (actions <= 14) return 9;
  return 10;
}

/**
 * Get recent XP transactions mapped by source — shows which modules
 * the user has been active in recently.
 */
export async function fetchRecentActivity(userId: string, limit = 10): Promise<{
  source: string;
  description: string;
  amount: number;
  earnedAt: string;
}[]> {
  const sb = supabase as any;
  const { data } = await sb
    .from("beyond_xp_transactions")
    .select("source, description, amount, earned_at")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })
    .limit(limit);

  return (data || []).map((row: any) => ({
    source: row.source,
    description: row.description || "",
    amount: row.amount,
    earnedAt: row.earned_at,
  }));
}

/**
 * Get the user's active wheel goals and their progress.
 */
export async function fetchActiveWheelGoals(userId: string): Promise<{
  id: string;
  spoke: SpokeKey;
  goalText: string;
  currentScore: number;
  targetScore: number;
  deadline: string | null;
  status: string;
}[]> {
  const sb = supabase as any;
  const { data } = await sb
    .from("beyond_wheel_goals")
    .select("id, spoke, goal_text, current_score, target_score, deadline, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (data || []).map((row: any) => ({
    id: row.id,
    spoke: row.spoke as SpokeKey,
    goalText: row.goal_text,
    currentScore: row.current_score,
    targetScore: row.target_score,
    deadline: row.deadline,
    status: row.status,
  }));
}
