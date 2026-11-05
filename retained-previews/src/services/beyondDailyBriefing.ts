/**
 * Beyond.Praxis — Daily Briefing Engine
 * 
 * Generates a personalized daily briefing for the user based on:
 * - Wheel of Life scores (weakest spoke nudge)
 * - Active streaks and streak risk warnings
 * - Pending goals and deadlines
 * - Recent activity summary
 * - Motivational insights
 * 
 * The briefing is time-of-day aware and adapts to the user's context.
 */

import { supabase } from "@/integrations/supabase/client";
import type { SpokeKey, CrossModuleSnapshot } from "./beyondCrossModule";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export interface DailyBriefing {
  greeting: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  priorities: BriefingPriority[];
  streakStatus: StreakAlert[];
  spokeNudge: SpokeNudge | null;
  upcomingDeadlines: DeadlineItem[];
  motivationalInsight: string;
  todayFocus: string;
  activitySummary: ActivitySummary;
  wheelReminder: WheelReminder | null;
}

export interface BriefingPriority {
  id: string;
  type: "streak_risk" | "goal_deadline" | "weak_spoke" | "challenge" | "wheel_reminder";
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  urgency: "high" | "medium" | "low";
  icon: string;
}

export interface StreakAlert {
  streakType: string;
  currentCount: number;
  status: "at_risk" | "active" | "broken";
  label: string;
  message: string;
}

export interface SpokeNudge {
  spoke: SpokeKey;
  label: string;
  score: number;
  message: string;
  suggestedAction: string;
  route: string;
}

export interface DeadlineItem {
  id: string;
  text: string;
  spoke: SpokeKey;
  daysUntil: number;
  deadline: string;
}

export interface ActivitySummary {
  actionsToday: number;
  actionsThisWeek: number;
  xpToday: number;
  xpThisWeek: number;
  modulesActive: number;
}

export interface WheelReminder {
  daysSince: number;
  message: string;
}

// ════════════════════════════════════════════════════════════
// GREETING & TIME HELPERS
// ════════════════════════════════════════════════════════════

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function getGreeting(name: string | null, timeOfDay: "morning" | "afternoon" | "evening"): string {
  const displayName = name || "Doctor";
  const greetings = {
    morning: [
      `Good morning, ${displayName}. Let's make today count.`,
      `Rise and shine, ${displayName}. Your day is full of potential.`,
      `Morning, ${displayName}. Ready to build your best self?`,
    ],
    afternoon: [
      `Good afternoon, ${displayName}. How's your momentum?`,
      `Hey ${displayName}, keeping the energy up this afternoon?`,
      `Afternoon check-in, ${displayName}. You're doing great.`,
    ],
    evening: [
      `Good evening, ${displayName}. Time to reflect and recharge.`,
      `Evening, ${displayName}. Let's wrap up strong.`,
      `Hey ${displayName}, you've earned a mindful evening.`,
    ],
  };
  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
}

// ════════════════════════════════════════════════════════════
// MOTIVATIONAL INSIGHTS
// ════════════════════════════════════════════════════════════

const INSIGHTS = [
  "Small daily improvements are the key to staggering long-term results.",
  "The doctor who invests in themselves serves patients at a higher level.",
  "Balance isn't perfection — it's intentional attention to what matters.",
  "Every spoke of your wheel strengthens the others when you tend to it.",
  "Progress over perfection. One step forward today compounds into mastery.",
  "Your growth outside the clinic directly fuels your excellence inside it.",
  "The best investment a doctor can make is in their own well-being.",
  "Consistency beats intensity. Show up daily, and the results will follow.",
  "Leadership starts with self-leadership. Master your own wheel first.",
  "A balanced life isn't a luxury — it's the foundation of sustainable success.",
];

function getMotivationalInsight(weakestSpoke?: SpokeKey): string {
  const spokeInsights: Partial<Record<SpokeKey, string[]>> = {
    clinical: [
      "Clinical mastery is a journey, not a destination. Every case teaches.",
      "The best clinicians never stop being students.",
    ],
    finance: [
      "Financial freedom gives you the power to practice medicine on your terms.",
      "Start where you are. Even small investments compound powerfully over time.",
    ],
    wellness: [
      "You can't pour from an empty cup. Prioritize your own health today.",
      "Even 5 minutes of breathwork can reset your entire nervous system.",
    ],
    time: [
      "Time is your most finite resource. Protect it fiercely.",
      "Deep work over busy work. Quality focus beats scattered hours.",
    ],
    joy: [
      "Joy isn't a reward — it's fuel. Make space for what lights you up.",
      "The happiest doctors have rich lives outside of medicine.",
    ],
  };

  if (weakestSpoke && spokeInsights[weakestSpoke]) {
    const options = spokeInsights[weakestSpoke]!;
    return options[Math.floor(Math.random() * options.length)];
  }

  return INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
}

// ════════════════════════════════════════════════════════════
// TODAY FOCUS GENERATOR
// ════════════════════════════════════════════════════════════

function generateTodayFocus(snapshot: CrossModuleSnapshot, streaks: any[]): string {
  // Prioritize: at-risk streaks > weak spokes > general encouragement
  const atRiskStreaks = streaks.filter((s) => s.status === "at_risk");
  if (atRiskStreaks.length > 0) {
    return `Protect your ${atRiskStreaks[0].label} streak today — you're at ${atRiskStreaks[0].currentCount} days!`;
  }

  if (snapshot.weakestSpokes.length > 0) {
    const weakest = snapshot.weakestSpokes[0];
    return `Today's focus: Give some love to ${weakest.label} (score: ${weakest.combinedScore}/10)`;
  }

  if (snapshot.totalActions7d === 0) {
    return "Start small today — one action in any module builds momentum.";
  }

  if (snapshot.overallHealth >= 7) {
    return "You're thriving! Maintain your momentum or stretch into a new challenge.";
  }

  return "Keep building across your wheel. Consistency is your superpower.";
}

// ════════════════════════════════════════════════════════════
// MAIN BRIEFING GENERATOR
// ════════════════════════════════════════════════════════════

export async function generateDailyBriefing(
  userId: string,
  snapshot: CrossModuleSnapshot
): Promise<DailyBriefing> {
  const sb = supabase as any;
  const timeOfDay = getTimeOfDay();
  const today = new Date().toISOString().split("T")[0];

  // ─── Fetch additional data ────────────────────────────────────────────────
  const [profileRes, streaksRes, goalsRes, xpTodayRes, xpWeekRes, todayTasksRes] = await Promise.all([
    sb.from("beyond_profiles").select("full_name").eq("user_id", userId).maybeSingle(),
    sb.from("beyond_streaks").select("streak_type, current_count, last_activity_at").eq("user_id", userId),
    sb.from("beyond_wheel_goals").select("id, spoke, goal_text, target_score, deadline, status")
      .eq("user_id", userId).eq("status", "active").order("deadline", { ascending: true }),
    sb.from("beyond_xp_transactions").select("amount").eq("user_id", userId)
      .gte("earned_at", `${today}T00:00:00`),
    sb.from("beyond_xp_transactions").select("amount").eq("user_id", userId)
      .gte("earned_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    sb.from("beyond_today_tasks").select("id", { count: "exact", head: true })
      .eq("user_id", userId).eq("date", today).eq("is_done", true),
  ]);

  const userName = profileRes.data?.full_name || null;
  const greeting = getGreeting(userName, timeOfDay);

  // ─── Process streaks ──────────────────────────────────────────────────────
  const streakLabels: Record<string, string> = {
    daily_login: "Login",
    learning: "Learning",
    wellness: "Wellness",
    planning: "Planning",
    reading: "Reading",
    reflection: "Reflection",
    finance: "Finance",
  };

  const now = new Date();
  const streakAlerts: StreakAlert[] = (streaksRes.data || []).map((streak: any) => {
    const lastActivity = streak.last_activity_at ? new Date(streak.last_activity_at) : null;
    const hoursSince = lastActivity ? (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60) : 999;

    let status: "at_risk" | "active" | "broken" = "active";
    let message = `${streak.current_count} day streak going strong!`;

    if (hoursSince > 36 && streak.current_count > 0) {
      status = "at_risk";
      message = `Your ${streak.current_count}-day streak is at risk! Act today to keep it alive.`;
    } else if (hoursSince > 48) {
      status = "broken";
      message = "Streak broken. Start a new one today!";
    }

    return {
      streakType: streak.streak_type,
      currentCount: streak.current_count,
      status,
      label: streakLabels[streak.streak_type] || streak.streak_type,
      message,
    };
  }).filter((s: StreakAlert) => s.currentCount > 0 || s.status === "at_risk");

  // ─── Process goals & deadlines ────────────────────────────────────────────
  const upcomingDeadlines: DeadlineItem[] = (goalsRes.data || [])
    .filter((g: any) => g.deadline)
    .map((g: any) => {
      const deadlineDate = new Date(g.deadline);
      const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: g.id,
        text: g.goal_text,
        spoke: g.spoke as SpokeKey,
        daysUntil,
        deadline: g.deadline,
      };
    })
    .filter((d: DeadlineItem) => d.daysUntil >= 0 && d.daysUntil <= 14)
    .sort((a: DeadlineItem, b: DeadlineItem) => a.daysUntil - b.daysUntil);

  // ─── Spoke nudge (weakest spoke) ─────────────────────────────────────────
  let spokeNudge: SpokeNudge | null = null;
  if (snapshot.weakestSpokes.length > 0) {
    const weakest = snapshot.weakestSpokes[0];
    const nudgeMessages: Record<SpokeKey, { message: string; action: string; route: string }> = {
      clinical: { message: "Your clinical spoke needs attention.", action: "Complete a micro-lesson or pathway", route: "/beyond/pathways" },
      finance: { message: "Your finance spoke is running low.", action: "Log today's expenses or review your budget", route: "/beyond/finance" },
      time: { message: "Time management could use a boost.", action: "Start a Pomodoro session or plan tomorrow", route: "/beyond/time-management" },
      leadership: { message: "Your leadership spoke needs nurturing.", action: "Try a leadership scenario", route: "/beyond/leadership" },
      relationships: { message: "Social connections are important.", action: "Post in the community or reach out to someone", route: "/beyond/community" },
      family: { message: "Family presence is your foundation.", action: "Write a gratitude entry about your family", route: "/beyond/wellness" },
      wellness: { message: "Your wellness spoke needs care.", action: "Do a breathing exercise or log your mood", route: "/beyond/wellness" },
      joy: { message: "Don't forget joy in the journey!", action: "Read something fun or journal about a happy moment", route: "/beyond/books" },
    };

    const nudge = nudgeMessages[weakest.spoke];
    spokeNudge = {
      spoke: weakest.spoke,
      label: weakest.label,
      score: weakest.combinedScore,
      message: nudge.message,
      suggestedAction: nudge.action,
      route: nudge.route,
    };
  }

  // ─── Build priorities list ────────────────────────────────────────────────
  const priorities: BriefingPriority[] = [];

  // At-risk streaks
  streakAlerts
    .filter((s) => s.status === "at_risk")
    .forEach((s) => {
      priorities.push({
        id: `streak-${s.streakType}`,
        type: "streak_risk",
        title: `${s.label} Streak at Risk`,
        description: s.message,
        actionLabel: `Maintain ${s.label}`,
        actionRoute: getStreakRoute(s.streakType),
        urgency: "high",
        icon: "flame",
      });
    });

  // Upcoming deadlines (within 3 days)
  upcomingDeadlines
    .filter((d) => d.daysUntil <= 3)
    .forEach((d) => {
      priorities.push({
        id: `deadline-${d.id}`,
        type: "goal_deadline",
        title: `Goal deadline: ${d.daysUntil === 0 ? "TODAY" : `in ${d.daysUntil} day${d.daysUntil > 1 ? "s" : ""}`}`,
        description: d.text,
        actionLabel: "Work on goal",
        actionRoute: "/beyond/wheel-of-life",
        urgency: d.daysUntil === 0 ? "high" : "medium",
        icon: "target",
      });
    });

  // Weak spoke nudge
  if (spokeNudge) {
    priorities.push({
      id: `spoke-${spokeNudge.spoke}`,
      type: "weak_spoke",
      title: `Strengthen: ${spokeNudge.label}`,
      description: spokeNudge.message,
      actionLabel: spokeNudge.suggestedAction,
      actionRoute: spokeNudge.route,
      urgency: spokeNudge.score <= 2 ? "high" : "medium",
      icon: "alert-triangle",
    });
  }

  // Wheel assessment reminder
  let wheelReminder: WheelReminder | null = null;
  if (snapshot.daysSinceAssessment !== null && snapshot.daysSinceAssessment >= 25) {
    wheelReminder = {
      daysSince: snapshot.daysSinceAssessment,
      message: snapshot.daysSinceAssessment >= 30
        ? "It's been over a month since your last Wheel assessment. Time for a check-in!"
        : "Your monthly Wheel assessment is coming up soon. Plan some reflection time.",
    };
    priorities.push({
      id: "wheel-reminder",
      type: "wheel_reminder",
      title: "Wheel Assessment Due",
      description: wheelReminder.message,
      actionLabel: "Assess now",
      actionRoute: "/beyond/wheel-of-life",
      urgency: snapshot.daysSinceAssessment >= 30 ? "medium" : "low",
      icon: "target",
    });
  } else if (snapshot.daysSinceAssessment === null) {
    wheelReminder = {
      daysSince: 0,
      message: "You haven't taken your first Wheel of Life assessment yet. Start your journey!",
    };
    priorities.push({
      id: "wheel-first",
      type: "wheel_reminder",
      title: "Take Your First Assessment",
      description: "The Wheel of Life reveals where to focus your growth energy.",
      actionLabel: "Start assessment",
      actionRoute: "/beyond/wheel-of-life",
      urgency: "medium",
      icon: "compass",
    });
  }

  // Sort priorities by urgency
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  priorities.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  // ─── Activity summary ─────────────────────────────────────────────────────
  const xpToday = (xpTodayRes.data || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  const xpThisWeek = (xpWeekRes.data || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

  const activitySummary: ActivitySummary = {
    actionsToday: todayTasksRes.count || 0,
    actionsThisWeek: snapshot.totalActions7d,
    xpToday,
    xpThisWeek,
    modulesActive: snapshot.activeModuleCount,
  };

  // ─── Assemble briefing ────────────────────────────────────────────────────
  const weakestSpokeKey = snapshot.weakestSpokes.length > 0 ? snapshot.weakestSpokes[0].spoke : undefined;
  const motivationalInsight = getMotivationalInsight(weakestSpokeKey);
  const todayFocus = generateTodayFocus(snapshot, streakAlerts);

  return {
    greeting,
    timeOfDay,
    priorities,
    streakStatus: streakAlerts,
    spokeNudge,
    upcomingDeadlines,
    motivationalInsight,
    todayFocus,
    activitySummary,
    wheelReminder,
  };
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function getStreakRoute(streakType: string): string {
  const routes: Record<string, string> = {
    daily_login: "/beyond",
    learning: "/beyond/pathways",
    wellness: "/beyond/wellness",
    planning: "/beyond/planner",
    reading: "/beyond/books",
    reflection: "/beyond/journal",
    finance: "/beyond/finance",
  };
  return routes[streakType] || "/beyond";
}
