import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getBadgesForRole, getCoinRulesForRole, getRank, getNextRank,
  BADGES, type RoleType, type Badge as BadgeType,
} from "@/data/gamificationConfig";

// Types
type UserCoinData = {
  totalCoins: number;
  totalPoints: number;
  currentRank: string;
};

type CoinTransaction = {
  id: string;
  action: string;
  coins: number;
  emoji: string;
  balance_after: number;
  created_at: string;
  badge_id: string | null;
};

type UserBadge = {
  badge_id: string;
  earned_at: string;
};

type StreakData = {
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
};

// 🎮 Main Gamification Hook
export const useGamification = (role: RoleType) => {
  const [loading, setLoading] = useState(true);
  const [coinData, setCoinData] = useState<UserCoinData>({ totalCoins: 0, totalPoints: 0, currentRank: "Beginner" });
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [streaks, setStreaks] = useState<StreakData[]>([]);

  // Load user gamification data
  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) { setLoading(false); return; }

    try {
      // Fetch coin balance
      const { data: coins } = await (supabase as any)
        .from("user_coins")
        .select("total_coins, total_points, current_rank")
        .eq("user_id", uid)
        .eq("role", role)
        .maybeSingle();

      if (coins) {
        setCoinData({ totalCoins: coins.total_coins, totalPoints: coins.total_points, currentRank: coins.current_rank });
      }

      // Fetch earned badges
      const { data: badges } = await (supabase as any)
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", uid);

      if (badges) {
        setEarnedBadges(badges.map((b: UserBadge) => b.badge_id));
      }

      // Fetch recent transactions
      const { data: txns } = await (supabase as any)
        .from("coin_transactions")
        .select("id, action, coins, emoji, balance_after, created_at, badge_id")
        .eq("user_id", uid)
        .eq("role", role)
        .order("created_at", { ascending: false })
        .limit(20);

      if (txns) setTransactions(txns);

      // Fetch streaks
      const { data: streakData } = await (supabase as any)
        .from("user_streaks")
        .select("streak_type, current_streak, longest_streak, last_activity_date")
        .eq("user_id", uid)
        .eq("role", role);

      if (streakData) setStreaks(streakData);
    } catch (err) {
      console.error("Gamification load error:", err);
    }

    setLoading(false);
  };

  useEffect(() => { loadData(); }, [role]);

  // 🪙 Award coins for an action
  const awardCoins = async (action: string, coins: number, emoji: string = "") => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) return;

    try {
      // Upsert user_coins
      const newTotal = coinData.totalCoins + coins;
      const newPoints = coinData.totalPoints + coins;
      const newRank = getRank(newPoints);

      await (supabase as any).from("user_coins").upsert({
        user_id: uid,
        role,
        total_coins: newTotal,
        total_points: newPoints,
        current_rank: newRank?.name || "Beginner",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,role" });

      // Insert transaction
      await (supabase as any).from("coin_transactions").insert({
        user_id: uid,
        role,
        action,
        coins,
        points: coins,
        emoji,
        balance_after: newTotal,
      });

      // Update local state
      setCoinData({ totalCoins: newTotal, totalPoints: newPoints, currentRank: newRank?.name || "Beginner" });

      // Toast notification
      toast.success(`+${coins} 🪙 Ayuzee Coins! ${emoji} ${action}`);

      // Check if rank changed
      const oldRank = getRank(coinData.totalPoints);
      if (newRank && oldRank && newRank.name !== oldRank.name) {
        toast.success(`🎉 Rank Up! You're now ${newRank.emoji} ${newRank.name}!`);
      }
    } catch (err) {
      console.error("Award coins error:", err);
    }
  };

  // 🏅 Award badge
  const awardBadge = async (badgeId: string) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid || earnedBadges.includes(badgeId)) return;

    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    try {
      await (supabase as any).from("user_badges").insert({
        user_id: uid,
        badge_id: badgeId,
        role,
        points_awarded: badge.points,
        coins_awarded: badge.points,
      });

      // Award the coins for the badge
      await awardCoins(`Badge unlocked: ${badge.name}`, badge.points, badge.emoji);

      // Update local state
      setEarnedBadges([...earnedBadges, badgeId]);

      // Special notification for badge
      toast.success(`🏅 Badge Unlocked! ${badge.emoji} ${badge.name} (+${badge.points}🪙)`);
    } catch (err) {
      console.error("Award badge error:", err);
    }
  };

  // 🔥 Update streak
  const updateStreak = async (streakType: string = "daily_login") => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) return;

    const today = new Date().toISOString().slice(0, 10);
    const existing = streaks.find(s => s.streak_type === streakType);

    let newStreak = 1;
    if (existing) {
      const lastDate = new Date(existing.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return; // Already logged today
      if (diffDays === 1) newStreak = existing.current_streak + 1; // Continue streak
      // If diffDays > 1, streak resets to 1
    }

    try {
      await (supabase as any).from("user_streaks").upsert({
        user_id: uid,
        role,
        streak_type: streakType,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, existing?.longest_streak || 0),
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,role,streak_type" });

      // Award streak bonuses
      if (newStreak === 7) await awardCoins("7-day streak bonus! 🔥", 25, "🔥");
      if (newStreak === 30) await awardCoins("30-day streak bonus! ⚡", 100, "⚡");
      if (newStreak === 90) await awardCoins("90-day streak! You're unstoppable! 💎", 250, "💎");
      if (newStreak === 365) await awardCoins("365-day streak! LEGENDARY! 👑", 1000, "👑");

      // Update local
      setStreaks(streaks.map(s => s.streak_type === streakType ? { ...s, current_streak: newStreak, last_activity_date: today } : s));
    } catch (err) {
      console.error("Update streak error:", err);
    }

    return newStreak;
  };

  // 💝 Send shout out
  const sendShoutOut = async (toUserId: string, toName: string, toRole: string, message: string, emoji: string) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) return;

    try {
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("full_name")
        .eq("user_id", uid)
        .maybeSingle();

      await (supabase as any).from("shout_outs").insert({
        from_user_id: uid,
        from_name: profile?.full_name || "User",
        from_role: role,
        to_user_id: toUserId,
        to_name: toName,
        to_role: toRole,
        message,
        emoji,
        coins_awarded: 5,
      });

      // Award coins to sender
      await awardCoins("Gave a Shout Out 💝", 5, "💝");

      toast.success(`💝 Shout Out sent to ${toName}! You both earned +5 🪙`);
    } catch (err) {
      console.error("Shout out error:", err);
    }
  };

  return {
    loading,
    coinData,
    earnedBadges,
    transactions,
    streaks,
    currentRank: getRank(coinData.totalPoints),
    nextRank: getNextRank(coinData.totalPoints),
    loginStreak: streaks.find(s => s.streak_type === "daily_login")?.current_streak || 0,
    // Actions
    awardCoins,
    awardBadge,
    updateStreak,
    sendShoutOut,
    refresh: loadData,
  };
};
