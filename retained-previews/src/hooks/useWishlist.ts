import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Lightweight wishlist hook backed by patient_wishlist.
 * Loads the user's wishlist once on mount and exposes optimistic toggle.
 */
export const useWishlist = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id ?? null;
      if (cancelled) return;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("patient_wishlist")
        .select("product_id")
        .eq("user_id", uid);
      if (cancelled) return;
      setIds(new Set(((data as { product_id: string }[]) ?? []).map((r) => r.product_id)));
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
      if (!session) setIds(new Set());
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isSaved = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!userId) {
        toast.error("Please sign in to save items");
        return;
      }
      const saved = ids.has(productId);
      // optimistic update
      setIds((prev) => {
        const next = new Set(prev);
        if (saved) next.delete(productId);
        else next.add(productId);
        return next;
      });

      if (saved) {
        const { error } = await supabase
          .from("patient_wishlist")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);
        if (error) {
          // revert
          setIds((prev) => {
            const next = new Set(prev);
            next.add(productId);
            return next;
          });
          toast.error("Could not remove from wishlist");
        } else {
          toast.success("Removed from wishlist");
        }
      } else {
        const { error } = await supabase
          .from("patient_wishlist")
          .insert({ user_id: userId, product_id: productId });
        if (error) {
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          toast.error("Could not save to wishlist");
        } else {
          toast.success("Saved to wishlist");
        }
      }
    },
    [userId, ids],
  );

  return { isSaved, toggle, userId, loading, count: ids.size };
};
