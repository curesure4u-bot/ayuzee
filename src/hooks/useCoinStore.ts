/**
 * Hook to manage the Coin Redemption Store —
 * listing store items, redeeming with coins, and viewing redemption history.
 * Integrates with useStudentProgress for coin balance.
 * Persists to Supabase tables: coin_store_items, coin_redemptions, student_quiz_progress, student_coin_transactions
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type StoreItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  coin_price: number;
  stock: number; // -1 = unlimited
  image_url: string | null;
  redemption_count: number;
  created_at: string;
};

export type Redemption = {
  id: string;
  item_id: string;
  item_title: string;
  coins_spent: number;
  status: string;
  redeemed_at: string;
};

// ---------- Hook: useCoinStore ----------

export function useCoinStore() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchStore = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    // Fetch store items
    const { data: itemsData } = await (supabase as any)
      .from("coin_store_items")
      .select("*")
      .eq("is_active", true)
      .order("coin_price", { ascending: true });

    setItems((itemsData || []) as StoreItem[]);

    if (uid) {
      // Fetch coin balance
      const { data: progress } = await (supabase as any)
        .from("student_quiz_progress")
        .select("coins")
        .eq("user_id", uid)
        .maybeSingle();

      setCoinBalance(progress?.coins ?? 0);

      // Fetch redemption history
      const { data: redemptionData } = await (supabase as any)
        .from("coin_redemptions")
        .select("*")
        .eq("user_id", uid)
        .order("redeemed_at", { ascending: false });

      setRedemptions((redemptionData || []) as Redemption[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const redeemItem = useCallback(
    async (item: StoreItem): Promise<{ success: boolean; error?: string }> => {
      if (!userId) return { success: false, error: "Not logged in" };

      // Check balance
      if (coinBalance < item.coin_price) {
        return { success: false, error: "Not enough coins" };
      }

      // Check stock
      if (item.stock === 0) {
        return { success: false, error: "Item is out of stock" };
      }

      // Deduct coins from student_quiz_progress
      const { error: deductError } = await (supabase as any)
        .from("student_quiz_progress")
        .update({ coins: coinBalance - item.coin_price })
        .eq("user_id", userId);

      if (deductError) {
        return { success: false, error: "Failed to deduct coins" };
      }

      // Log coin transaction
      await (supabase as any).from("student_coin_transactions").insert({
        user_id: userId,
        amount: -item.coin_price,
        reason: `Redeemed: ${item.title}`,
        created_at: new Date().toISOString(),
      });

      // Create redemption record
      const { error: redeemError } = await (supabase as any)
        .from("coin_redemptions")
        .insert({
          user_id: userId,
          item_id: item.id,
          item_title: item.title,
          coins_spent: item.coin_price,
          status: "completed",
        });

      if (redeemError) {
        // Rollback coins (best-effort)
        await (supabase as any)
          .from("student_quiz_progress")
          .update({ coins: coinBalance })
          .eq("user_id", userId);
        return { success: false, error: "Failed to create redemption" };
      }

      // Update local state
      setCoinBalance((prev) => prev - item.coin_price);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                redemption_count: i.redemption_count + 1,
                stock: i.stock > 0 ? i.stock - 1 : i.stock,
              }
            : i
        )
      );
      setRedemptions((prev) => [
        {
          id: crypto.randomUUID(),
          item_id: item.id,
          item_title: item.title,
          coins_spent: item.coin_price,
          status: "completed",
          redeemed_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      return { success: true };
    },
    [userId, coinBalance]
  );

  return { items, redemptions, coinBalance, loading, userId, redeemItem, refetch: fetchStore };
}
