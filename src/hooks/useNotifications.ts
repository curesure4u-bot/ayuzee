import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type UnifiedNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  source_module: string;
  source_id: string | null;
  source_url: string | null;
  is_read: boolean;
  read_at: string | null;
  is_dismissed: boolean;
  priority: string;
  expires_at: string | null;
  created_at: string;
};

/**
 * Hook to manage unified notifications.
 * Falls back gracefully if the table doesn't exist yet.
 */
export function useNotifications() {
  const [userId, setUserId] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });
  }, []);

  const query = useQuery({
    queryKey: ["unified-notifications", userId],
    queryFn: async (): Promise<UnifiedNotification[]> => {
      if (!userId) return [];
      try {
        const { data, error } = await (supabase as any)
          .from("unified_notifications")
          .select("*")
          .eq("user_id", userId)
          .eq("is_dismissed", false)
          .order("created_at", { ascending: false })
          .limit(30);
        if (error) throw error;
        return data || [];
      } catch {
        return []; // Table may not exist
      }
    },
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any)
        .from("unified_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["unified-notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await (supabase as any)
        .from("unified_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("is_read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["unified-notifications"] }),
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      await (supabase as any)
        .from("unified_notifications")
        .update({ is_dismissed: true })
        .eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["unified-notifications"] }),
  });

  const createNotification = useMutation({
    mutationFn: async (notif: { title: string; message: string; type: string; source_module: string; source_url?: string; priority?: string }) => {
      if (!userId) return;
      await (supabase as any)
        .from("unified_notifications")
        .insert({ ...notif, user_id: userId, priority: notif.priority || "normal" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["unified-notifications"] }),
  });

  return {
    notifications: query.data || [],
    unreadCount: (query.data || []).filter(n => !n.is_read).length,
    isLoading: query.isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    dismiss: dismissMutation.mutate,
    createNotification: createNotification.mutate,
  };
}
