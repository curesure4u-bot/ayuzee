/**
 * useBeyondDashboardData — Unified React hook for the interconnected dashboard.
 * 
 * Aggregates:
 * - Cross-module snapshot (spoke health, activity scores, trends)
 * - Daily briefing (greeting, priorities, streak alerts, nudges)
 * - Smart recommendations (top picks, focus spoke)
 * - Recent activity feed (XP transactions)
 * - Gamification stats (XP, level, coins, streaks, badges)
 * 
 * Single hook, single loading state, single error state.
 * Refreshes on mount and exposes a manual refresh function.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchCrossModuleSnapshot, fetchRecentActivity, fetchActiveWheelGoals } from "@/services/beyondCrossModule";
import { generateDailyBriefing } from "@/services/beyondDailyBriefing";
import { generateRecommendations } from "@/services/beyondRecommendations";
import type { CrossModuleSnapshot } from "@/services/beyondCrossModule";
import type { DailyBriefing } from "@/services/beyondDailyBriefing";
import type { RecommendationSet } from "@/services/beyondRecommendations";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export interface GamificationStats {
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  xpToNext: number;
  coins: number;
  badgeCount: number;
  streaks: { streak_type: string; current_count: number; longest_count: number }[];
}

export interface RecentActivityItem {
  source: string;
  description: string;
  amount: number;
  earnedAt: string;
}

export interface WheelGoal {
  id: string;
  spoke: string;
  goalText: string;
  currentScore: number;
  targetScore: number;
  deadline: string | null;
  status: string;
}

export interface DashboardData {
  // Core data layers
  snapshot: CrossModuleSnapshot | null;
  briefing: DailyBriefing | null;
  recommendations: RecommendationSet | null;

  // Gamification
  gamification: GamificationStats;

  // Activity feed
  recentActivity: RecentActivityItem[];

  // Active goals
  activeGoals: WheelGoal[];

  // Active challenges
  activeChallenges: { id: string; title: string; description: string; xp_reward: number; type: string }[];

  // State
  loading: boolean;
  error: string | null;
  lastRefreshed: Date | null;
}

// ════════════════════════════════════════════════════════════
// HOOK
// ════════════════════════════════════════════════════════════

export function useBeyondDashboardData() {
  const [data, setData] = useState<DashboardData>({
    snapshot: null,
    briefing: null,
    recommendations: null,
    gamification: {
      totalXp: 0,
      currentLevel: 1,
      levelTitle: "Intern",
      xpToNext: 500,
      coins: 0,
      badgeCount: 0,
      streaks: [],
    },
    recentActivity: [],
    activeGoals: [],
    activeChallenges: [],
    loading: true,
    error: null,
    lastRefreshed: null,
  });

  const loadDashboard = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setData((prev) => ({ ...prev, loading: false, error: "Not authenticated" }));
        return;
      }

      const userId = session.session.user.id;
      const sb = supabase as any;

      // ─── Layer 1: Gamification stats (fast, small queries) ──────────────
      const [xpRes, coinRes, streakRes, badgeRes, challengeRes] = await Promise.all([
        sb.from("beyond_user_xp").select("total_xp, current_level, level_title, xp_to_next_level").eq("user_id", userId).maybeSingle(),
        sb.from("beyond_coin_balance").select("balance").eq("user_id", userId).maybeSingle(),
        sb.from("beyond_streaks").select("streak_type, current_count, longest_count").eq("user_id", userId),
        sb.from("beyond_user_badges").select("id").eq("user_id", userId),
        sb.from("beyond_challenges").select("id, title, description, xp_reward, type").eq("is_active", true).limit(6),
      ]);

      const gamification: GamificationStats = {
        totalXp: xpRes.data?.total_xp || 0,
        currentLevel: xpRes.data?.current_level || 1,
        levelTitle: xpRes.data?.level_title || "Intern",
        xpToNext: xpRes.data?.xp_to_next_level || 500,
        coins: coinRes.data?.balance || 0,
        badgeCount: badgeRes.data?.length || 0,
        streaks: streakRes.data || [],
      };

      // ─── Layer 2: Cross-module snapshot (the interconnection layer) ─────
      const [snapshot, recentActivity, activeGoals] = await Promise.all([
        fetchCrossModuleSnapshot(userId),
        fetchRecentActivity(userId, 15),
        fetchActiveWheelGoals(userId),
      ]);

      // ─── Layer 3: Briefing + Recommendations (depend on snapshot) ───────
      const [briefing, recommendations] = await Promise.all([
        generateDailyBriefing(userId, snapshot),
        Promise.resolve(generateRecommendations(snapshot)),
      ]);

      setData({
        snapshot,
        briefing,
        recommendations,
        gamification,
        recentActivity,
        activeGoals,
        activeChallenges: challengeRes.data || [],
        loading: false,
        error: null,
        lastRefreshed: new Date(),
      });
    } catch (err: any) {
      console.error("[useBeyondDashboardData] Error:", err);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to load dashboard data",
      }));
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    ...data,
    refresh: loadDashboard,
  };
}
