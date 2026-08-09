/**
 * useBeyondGamification — React hook for easy gamification access
 * Provides methods to earn XP, update streaks, check badges from any component.
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  earnXP,
  earnCoins,
  updateStreak,
  awardBadge,
  checkAndAwardBadges,
  spendCoins,
  type StreakType,
} from "@/services/beyondGamification";

export function useBeyondGamification() {
  const getUserId = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id || null;
  }, []);

  const addXP = useCallback(
    async (amount: number, source: string, description?: string) => {
      const userId = await getUserId();
      if (!userId) return null;
      return earnXP(userId, amount, source, description);
    },
    [getUserId]
  );

  const addCoins = useCallback(
    async (amount: number, source: string, description?: string) => {
      const userId = await getUserId();
      if (!userId) return null;
      return earnCoins(userId, amount, source, description);
    },
    [getUserId]
  );

  const removeCoins = useCallback(
    async (amount: number, source: string, description?: string) => {
      const userId = await getUserId();
      if (!userId) return { success: false, newBalance: 0 };
      return spendCoins(userId, amount, source, description);
    },
    [getUserId]
  );

  const recordStreak = useCallback(
    async (streakType: StreakType) => {
      const userId = await getUserId();
      if (!userId) return null;
      return updateStreak(userId, streakType);
    },
    [getUserId]
  );

  const grantBadge = useCallback(
    async (badgeName: string) => {
      const userId = await getUserId();
      if (!userId) return null;
      return awardBadge(userId, badgeName);
    },
    [getUserId]
  );

  const checkBadges = useCallback(
    async (context: Parameters<typeof checkAndAwardBadges>[1]) => {
      const userId = await getUserId();
      if (!userId) return;
      return checkAndAwardBadges(userId, context);
    },
    [getUserId]
  );

  return {
    addXP,
    addCoins,
    removeCoins,
    recordStreak,
    grantBadge,
    checkBadges,
  };
}
