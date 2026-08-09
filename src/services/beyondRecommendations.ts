/**
 * Beyond.Praxis — Smart Recommendations Engine
 * 
 * Analyzes the user's weak spokes (from the CrossModuleSnapshot) and generates
 * specific, actionable recommendations that link directly to the relevant module pages.
 * 
 * Each recommendation includes:
 * - Why it's recommended (tied to spoke weakness)
 * - What specific action to take
 * - Expected impact on the spoke
 * - Direct link to the module
 * - Estimated time to complete
 * - XP reward potential
 * 
 * Recommendations are prioritized by:
 * 1. Spoke weakness severity (lower score = higher priority)
 * 2. Time since last activity in that module
 * 3. Quick wins first (low effort, high impact)
 */

import type { SpokeKey, CrossModuleSnapshot, SpokeHealth } from "./beyondCrossModule";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export interface Recommendation {
  id: string;
  spoke: SpokeKey;
  spokeLabel: string;
  title: string;
  description: string;
  reason: string;
  actionLabel: string;
  route: string;
  estimatedMinutes: number;
  xpPotential: number;
  impact: "high" | "medium" | "low";
  category: "quick_win" | "deep_work" | "habit" | "reflection" | "social";
  icon: string;
}

export interface RecommendationSet {
  topPicks: Recommendation[];       // Top 3 highest priority
  allRecommendations: Recommendation[];  // All generated recommendations
  focusSpoke: SpokeKey | null;      // The spoke that needs most attention
  focusSpokeLabel: string;
  summary: string;                  // Human-readable summary
}

// ════════════════════════════════════════════════════════════
// RECOMMENDATION CATALOG — mapped by spoke
// ════════════════════════════════════════════════════════════

interface RecommendationTemplate {
  title: string;
  description: string;
  actionLabel: string;
  route: string;
  estimatedMinutes: number;
  xpPotential: number;
  impact: "high" | "medium" | "low";
  category: "quick_win" | "deep_work" | "habit" | "reflection" | "social";
  icon: string;
  /** If set, only show when activity count for this module is below threshold */
  activityThreshold?: { module: string; below: number };
}

const RECOMMENDATION_CATALOG: Record<SpokeKey, RecommendationTemplate[]> = {
  clinical: [
    {
      title: "Complete a Micro-Lesson",
      description: "Spend 5 minutes on a bite-sized clinical learning module. Small consistent steps build expertise.",
      actionLabel: "Start lesson",
      route: "/beyond/micro-learning",
      estimatedMinutes: 5,
      xpPotential: 50,
      impact: "medium",
      category: "quick_win",
      icon: "book-open",
    },
    {
      title: "Advance Your Learning Pathway",
      description: "Continue your enrolled pathway — structured learning that builds clinical mastery over time.",
      actionLabel: "Continue pathway",
      route: "/beyond/pathways",
      estimatedMinutes: 15,
      xpPotential: 100,
      impact: "high",
      category: "deep_work",
      icon: "rocket",
    },
    {
      title: "Try the AI Clinical Companion",
      description: "Practice clinical reasoning with AI-powered case discussions. Safe space to sharpen diagnostic thinking.",
      actionLabel: "Open AI companion",
      route: "/beyond/ai-companion",
      estimatedMinutes: 10,
      xpPotential: 75,
      impact: "high",
      category: "deep_work",
      icon: "brain",
    },
    {
      title: "Read a Clinical Book",
      description: "Pick up where you left off or start a new clinical text from the curated library.",
      actionLabel: "Browse books",
      route: "/beyond/books",
      estimatedMinutes: 20,
      xpPotential: 50,
      impact: "medium",
      category: "deep_work",
      icon: "book-open",
    },
  ],

  finance: [
    {
      title: "Log Today's Expenses",
      description: "Take 2 minutes to record what you spent today. Awareness is the first step to financial control.",
      actionLabel: "Log expenses",
      route: "/beyond/finance",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "medium",
      category: "quick_win",
      icon: "coins",
    },
    {
      title: "Review Your Monthly Budget",
      description: "See where your money went this month. Identify one area to optimize.",
      actionLabel: "Review budget",
      route: "/beyond/finance",
      estimatedMinutes: 10,
      xpPotential: 50,
      impact: "high",
      category: "reflection",
      icon: "trending-up",
    },
    {
      title: "Explore Side Income Ideas",
      description: "Doctors have unique skills that translate to income beyond clinical work. See what fits you.",
      actionLabel: "Explore options",
      route: "/beyond/side-income",
      estimatedMinutes: 10,
      xpPotential: 50,
      impact: "medium",
      category: "deep_work",
      icon: "lightbulb",
    },
    {
      title: "Set a Finance Streak",
      description: "Commit to logging expenses daily. Build the habit that transforms your financial health.",
      actionLabel: "Start tracking",
      route: "/beyond/finance",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "high",
      category: "habit",
      icon: "flame",
    },
  ],

  time: [
    {
      title: "Run a Pomodoro Session",
      description: "25 minutes of focused work. One Pomodoro can shift your entire day's productivity.",
      actionLabel: "Start Pomodoro",
      route: "/beyond/time-management",
      estimatedMinutes: 25,
      xpPotential: 50,
      impact: "high",
      category: "deep_work",
      icon: "timer",
    },
    {
      title: "Plan Tomorrow's Tasks",
      description: "Spend 5 minutes tonight planning tomorrow. You'll wake up with direction and purpose.",
      actionLabel: "Plan tasks",
      route: "/beyond/planner",
      estimatedMinutes: 5,
      xpPotential: 25,
      impact: "high",
      category: "quick_win",
      icon: "list-checks",
    },
    {
      title: "Log Your Energy Patterns",
      description: "Track when you're most energized. Schedule deep work during peak hours.",
      actionLabel: "Log energy",
      route: "/beyond/time-management",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "medium",
      category: "quick_win",
      icon: "zap",
    },
    {
      title: "Create a Weekly Plan",
      description: "Map out your week with intention. Assign time blocks for work, wellness, and joy.",
      actionLabel: "Plan week",
      route: "/beyond/time-management",
      estimatedMinutes: 15,
      xpPotential: 75,
      impact: "high",
      category: "deep_work",
      icon: "calendar",
    },
  ],

  leadership: [
    {
      title: "Practice a Leadership Scenario",
      description: "Navigate a real-world medical leadership challenge. Build your decision-making muscles.",
      actionLabel: "Start scenario",
      route: "/beyond/leadership",
      estimatedMinutes: 10,
      xpPotential: 100,
      impact: "high",
      category: "deep_work",
      icon: "compass",
    },
    {
      title: "Share Knowledge in Community",
      description: "Answer a question or share an insight. Teaching solidifies your own understanding.",
      actionLabel: "Visit community",
      route: "/beyond/community",
      estimatedMinutes: 5,
      xpPotential: 50,
      impact: "medium",
      category: "social",
      icon: "users",
    },
    {
      title: "Explore Teaching Opportunities",
      description: "Create or review teaching content. Leadership through education amplifies your impact.",
      actionLabel: "Teaching toolkit",
      route: "/beyond/teaching",
      estimatedMinutes: 15,
      xpPotential: 75,
      impact: "medium",
      category: "deep_work",
      icon: "presentation",
    },
    {
      title: "Write a Professional Article",
      description: "Start drafting a short piece. Writing clarifies thinking and builds thought leadership.",
      actionLabel: "Open Writer's Studio",
      route: "/beyond/writing",
      estimatedMinutes: 20,
      xpPotential: 100,
      impact: "high",
      category: "deep_work",
      icon: "pen-tool",
    },
  ],

  relationships: [
    {
      title: "Post in the Community",
      description: "Share a win, ask a question, or offer support. Connection starts with showing up.",
      actionLabel: "Open community",
      route: "/beyond/community",
      estimatedMinutes: 5,
      xpPotential: 50,
      impact: "medium",
      category: "social",
      icon: "message-circle",
    },
    {
      title: "Reply to a Peer's Post",
      description: "Engage with someone else's content. Meaningful connections are built through interaction.",
      actionLabel: "Browse posts",
      route: "/beyond/community",
      estimatedMinutes: 3,
      xpPotential: 25,
      impact: "medium",
      category: "quick_win",
      icon: "heart",
    },
    {
      title: "Journal About a Relationship",
      description: "Reflect on a key relationship in your life. What can you appreciate or improve?",
      actionLabel: "Open journal",
      route: "/beyond/journal",
      estimatedMinutes: 10,
      xpPotential: 50,
      impact: "medium",
      category: "reflection",
      icon: "pen",
    },
    {
      title: "Schedule Social Time",
      description: "Block 30 minutes this week for a meaningful conversation with a friend or colleague.",
      actionLabel: "Plan in Life Planner",
      route: "/beyond/planner",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "high",
      category: "quick_win",
      icon: "calendar-heart",
    },
  ],

  family: [
    {
      title: "Write a Gratitude Entry",
      description: "Three things you're grateful for about your family. Gratitude strengthens bonds.",
      actionLabel: "Open gratitude",
      route: "/beyond/wellness",
      estimatedMinutes: 3,
      xpPotential: 25,
      impact: "medium",
      category: "quick_win",
      icon: "heart",
    },
    {
      title: "Plan Device-Free Family Time",
      description: "Schedule 30 minutes of undistracted presence with your family today or tomorrow.",
      actionLabel: "Add to planner",
      route: "/beyond/planner",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "high",
      category: "quick_win",
      icon: "home",
    },
    {
      title: "Journal About Family Presence",
      description: "Reflect: When did you last feel truly present with family? What made it special?",
      actionLabel: "Open journal",
      route: "/beyond/journal",
      estimatedMinutes: 10,
      xpPotential: 50,
      impact: "medium",
      category: "reflection",
      icon: "pen",
    },
    {
      title: "Set a Family Goal on Your Wheel",
      description: "Define a specific, measurable goal for your Family spoke. Intention creates change.",
      actionLabel: "Set goal",
      route: "/beyond/wheel-of-life",
      estimatedMinutes: 5,
      xpPotential: 50,
      impact: "high",
      category: "reflection",
      icon: "target",
    },
  ],

  wellness: [
    {
      title: "2-Minute Breathing Exercise",
      description: "Reset your nervous system with a quick breathing pattern. Your body will thank you.",
      actionLabel: "Start breathing",
      route: "/beyond/wellness",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "medium",
      category: "quick_win",
      icon: "wind",
    },
    {
      title: "Log Your Mood & Energy",
      description: "Track how you're feeling right now. Self-awareness is the foundation of wellness.",
      actionLabel: "Log mood",
      route: "/beyond/wellness",
      estimatedMinutes: 1,
      xpPotential: 25,
      impact: "medium",
      category: "quick_win",
      icon: "smile",
    },
    {
      title: "Check Off Your Habits Today",
      description: "Open your habit tracker and mark what you've done. Visual progress builds motivation.",
      actionLabel: "Open habits",
      route: "/beyond/habits",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "medium",
      category: "habit",
      icon: "check-circle",
    },
    {
      title: "Plan a Micro-Workout",
      description: "Even 7 minutes of movement between patients counts. Add it to your day.",
      actionLabel: "Add to planner",
      route: "/beyond/planner",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "high",
      category: "quick_win",
      icon: "activity",
    },
  ],

  joy: [
    {
      title: "Read for Pleasure",
      description: "Pick up a non-clinical book. Joy reading reduces stress and sparks creativity.",
      actionLabel: "Browse library",
      route: "/beyond/books",
      estimatedMinutes: 15,
      xpPotential: 50,
      impact: "medium",
      category: "deep_work",
      icon: "book-open",
    },
    {
      title: "Journal a Happy Moment",
      description: "Write about something that made you smile today. Savor the small wins.",
      actionLabel: "Open journal",
      route: "/beyond/journal",
      estimatedMinutes: 5,
      xpPotential: 50,
      impact: "medium",
      category: "reflection",
      icon: "smile",
    },
    {
      title: "Accept a Fun Challenge",
      description: "Pick a challenge that excites you. Gamified goals make growth feel like play.",
      actionLabel: "View challenges",
      route: "/beyond/challenges",
      estimatedMinutes: 5,
      xpPotential: 75,
      impact: "medium",
      category: "quick_win",
      icon: "trophy",
    },
    {
      title: "Schedule 'Play Time' This Week",
      description: "Block time for a hobby, game, or creative activity. Joy is not optional — it's fuel.",
      actionLabel: "Add to planner",
      route: "/beyond/planner",
      estimatedMinutes: 2,
      xpPotential: 25,
      impact: "high",
      category: "quick_win",
      icon: "sparkles",
    },
  ],
};

// ════════════════════════════════════════════════════════════
// MAIN RECOMMENDATION GENERATOR
// ════════════════════════════════════════════════════════════

export function generateRecommendations(snapshot: CrossModuleSnapshot): RecommendationSet {
  const allRecommendations: Recommendation[] = [];

  // Generate recommendations for all spokes below 7 (room for improvement)
  const spokesNeedingWork = snapshot.spokes
    .filter((s) => s.combinedScore < 7)
    .sort((a, b) => a.combinedScore - b.combinedScore);

  for (const spokeHealth of spokesNeedingWork) {
    const templates = RECOMMENDATION_CATALOG[spokeHealth.spoke];
    const reason = buildReason(spokeHealth);

    for (const template of templates) {
      allRecommendations.push({
        id: `${spokeHealth.spoke}-${template.title.toLowerCase().replace(/\s+/g, "-")}`,
        spoke: spokeHealth.spoke,
        spokeLabel: spokeHealth.label,
        title: template.title,
        description: template.description,
        reason,
        actionLabel: template.actionLabel,
        route: template.route,
        estimatedMinutes: template.estimatedMinutes,
        xpPotential: template.xpPotential,
        impact: template.impact,
        category: template.category,
        icon: template.icon,
      });
    }
  }

  // Score and rank all recommendations
  const scored = allRecommendations.map((rec) => {
    const spokeData = snapshot.spokes.find((s) => s.spoke === rec.spoke)!;
    let score = 0;

    // Lower spoke score = higher recommendation priority
    score += (10 - spokeData.combinedScore) * 10;

    // Impact multiplier
    score += rec.impact === "high" ? 30 : rec.impact === "medium" ? 15 : 5;

    // Quick wins get a boost (easy to start)
    if (rec.category === "quick_win") score += 20;

    // Lower time commitment = more likely to be done
    if (rec.estimatedMinutes <= 5) score += 15;
    else if (rec.estimatedMinutes <= 10) score += 8;

    // Spokes with zero recent activity get extra weight
    if (spokeData.totalActions7d === 0) score += 25;

    return { ...rec, _score: score };
  });

  // Sort by score descending
  scored.sort((a, b) => b._score - a._score);

  // Remove duplicate routes from top picks (variety)
  const topPicks: Recommendation[] = [];
  const usedRoutes = new Set<string>();
  const usedSpokes = new Set<string>();

  for (const rec of scored) {
    if (topPicks.length >= 3) break;
    // Ensure variety: different routes and at most 2 from same spoke
    if (!usedRoutes.has(rec.route)) {
      const spokeCount = [...usedSpokes].filter((s) => s === rec.spoke).length;
      if (spokeCount < 2) {
        topPicks.push(rec);
        usedRoutes.add(rec.route);
        usedSpokes.add(rec.spoke);
      }
    }
  }

  // Focus spoke
  const focusSpoke = spokesNeedingWork.length > 0 ? spokesNeedingWork[0].spoke : null;
  const focusSpokeLabel = focusSpoke
    ? snapshot.spokes.find((s) => s.spoke === focusSpoke)!.label
    : "All spokes balanced";

  // Summary
  const summary = buildSummary(snapshot, spokesNeedingWork);

  return {
    topPicks,
    allRecommendations: scored,
    focusSpoke,
    focusSpokeLabel,
    summary,
  };
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function buildReason(spokeHealth: SpokeHealth): string {
  const { label, combinedScore, activityScore, wheelScore, totalActions7d } = spokeHealth;

  if (combinedScore <= 3) {
    return `Your ${label} spoke is critically low (${combinedScore}/10). This needs immediate attention.`;
  }

  if (activityScore <= 2 && wheelScore >= 5) {
    return `You rated ${label} at ${wheelScore}/10, but you haven't been active here recently. Action backs up intention.`;
  }

  if (totalActions7d === 0) {
    return `No activity in ${label} this week. Even one small action keeps momentum alive.`;
  }

  if (combinedScore <= 5) {
    return `${label} is below average (${combinedScore}/10). Small consistent actions will raise this spoke.`;
  }

  return `${label} has room to grow (${combinedScore}/10). A focused effort can push it higher.`;
}

function buildSummary(snapshot: CrossModuleSnapshot, weakSpokes: SpokeHealth[]): string {
  if (weakSpokes.length === 0) {
    return "All your spokes are looking healthy! Keep maintaining your balanced approach.";
  }

  if (weakSpokes.length === 1) {
    return `Focus area: ${weakSpokes[0].label}. One spoke needs extra love — the recommendations below will help.`;
  }

  if (weakSpokes.length <= 3) {
    const names = weakSpokes.slice(0, 3).map((s) => s.label).join(", ");
    return `Areas to nurture: ${names}. Start with any one recommendation — momentum builds from action.`;
  }

  return `${weakSpokes.length} spokes need attention. Don't try to fix everything at once. Pick one recommendation and start there.`;
}

/**
 * Get recommendations filtered for a specific spoke.
 * Useful for spoke-detail views or drill-down panels.
 */
export function getRecommendationsForSpoke(
  spoke: SpokeKey,
  snapshot: CrossModuleSnapshot
): Recommendation[] {
  const full = generateRecommendations(snapshot);
  return full.allRecommendations.filter((r) => r.spoke === spoke);
}

/**
 * Get a single "nudge" recommendation — the most impactful quick action
 * for the user's weakest spoke. Used for notification-style prompts.
 */
export function getQuickNudge(snapshot: CrossModuleSnapshot): Recommendation | null {
  const full = generateRecommendations(snapshot);
  // Find the quickest, highest-impact recommendation
  const quickWins = full.allRecommendations
    .filter((r) => r.category === "quick_win" && r.estimatedMinutes <= 5)
    .sort((a, b) => {
      const aSpoke = snapshot.spokes.find((s) => s.spoke === a.spoke)!;
      const bSpoke = snapshot.spokes.find((s) => s.spoke === b.spoke)!;
      return aSpoke.combinedScore - bSpoke.combinedScore;
    });

  return quickWins[0] || full.topPicks[0] || null;
}
