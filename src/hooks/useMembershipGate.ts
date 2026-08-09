/**
 * useMembershipGate — Hook to check user's membership tier and gate content.
 * 
 * Usage:
 *   const { tier, canAccess, isLoading, showUpgrade } = useMembershipGate();
 * 
 *   // Check if user can access a Pro feature:
 *   if (!canAccess("pro")) return <UpgradePrompt />;
 * 
 *   // Or use the tier directly:
 *   if (tier === "free") { ... }
 * 
 * Tiers: "free" (0) → "pro" (1) → "elite" (2)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MembershipTier = "free" | "pro" | "elite";

const TIER_LEVELS: Record<MembershipTier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
};

interface MembershipState {
  tier: MembershipTier;
  tierLevel: number;
  planName: string;
  status: string;
  billingCycle: string | null;
  expiresAt: string | null;
  isLoading: boolean;
}

export function useMembershipGate() {
  const [state, setState] = useState<MembershipState>({
    tier: "free",
    tierLevel: 0,
    planName: "Free",
    status: "active",
    billingCycle: null,
    expiresAt: null,
    isLoading: true,
  });

  useEffect(() => {
    loadMembership();
  }, []);

  const loadMembership = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const { data } = await (supabase as any)
      .from("beyond_membership_subscriptions")
      .select("plan_slug, status, billing_cycle, expires_at")
      .eq("user_id", session.session.user.id)
      .eq("status", "active")
      .maybeSingle();

    if (data) {
      const slug = data.plan_slug as MembershipTier;
      setState({
        tier: slug,
        tierLevel: TIER_LEVELS[slug] ?? 0,
        planName: slug.charAt(0).toUpperCase() + slug.slice(1),
        status: data.status,
        billingCycle: data.billing_cycle,
        expiresAt: data.expires_at,
        isLoading: false,
      });
    } else {
      // No subscription found — default to free
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Check if the user's tier is high enough to access a feature.
   * @param requiredTier - The minimum tier needed ("free" | "pro" | "elite")
   * @returns true if user's tier >= requiredTier
   */
  const canAccess = useCallback(
    (requiredTier: MembershipTier): boolean => {
      return state.tierLevel >= TIER_LEVELS[requiredTier];
    },
    [state.tierLevel]
  );

  /**
   * Check if user can access by numeric tier level (0=free, 1=pro, 2=elite)
   */
  const canAccessLevel = useCallback(
    (requiredLevel: number): boolean => {
      return state.tierLevel >= requiredLevel;
    },
    [state.tierLevel]
  );

  /**
   * Returns true if user should be shown an upgrade prompt for a feature.
   */
  const showUpgrade = useCallback(
    (requiredTier: MembershipTier): boolean => {
      return state.tierLevel < TIER_LEVELS[requiredTier];
    },
    [state.tierLevel]
  );

  /**
   * Check if subscription is expired
   */
  const isExpired = state.expiresAt ? new Date(state.expiresAt) < new Date() : false;

  return {
    ...state,
    canAccess,
    canAccessLevel,
    showUpgrade,
    isExpired,
    isFree: state.tier === "free",
    isPro: state.tier === "pro" || state.tier === "elite",
    isElite: state.tier === "elite",
    refresh: loadMembership,
  };
}
