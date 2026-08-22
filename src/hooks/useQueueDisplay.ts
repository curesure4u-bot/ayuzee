import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type QueueState = {
  id: string;
  config_id: string;
  current_token: number;
  current_patient_name: string | null;
  next_token: number | null;
  total_waiting: number;
  total_served: number;
  avg_wait_min: number;
  last_called_at: string | null;
  display_date: string;
};

export function useQueueDisplay(branch = "Main Branch") {
  const [queueStates, setQueueStates] = useState<QueueState[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  const loadStates = async () => {
    const { data } = await (supabase as any)
      .from("hms_queue_display_state")
      .select("*, hms_queue_config(display_name, doctor_name, department, prefix)")
      .eq("display_date", today)
      .eq("branch", branch);

    setQueueStates(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadStates();

    const channel = supabase
      .channel("queue-display-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "hms_queue_display_state" }, () => {
        loadStates();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [branch]);

  const callNextToken = async (configId: string) => {
    // Get current state
    const { data: state } = await (supabase as any)
      .from("hms_queue_display_state")
      .select("*")
      .eq("config_id", configId)
      .eq("display_date", today)
      .single();

    const nextToken = (state?.current_token || 0) + 1;

    // Find patient for this token from OPD visits
    const { data: visit } = await (supabase as any)
      .from("hms_op_visits")
      .select("patient_display_id")
      .eq("visit_date", today)
      .eq("session_token", nextToken)
      .eq("branch", branch)
      .single();

    // Get waiting count
    const { count } = await (supabase as any)
      .from("hms_op_visits")
      .select("id", { count: "exact" })
      .eq("visit_date", today)
      .eq("status", "checked_in")
      .eq("branch", branch);

    const updateData = {
      current_token: nextToken,
      current_patient_name: visit?.patient_display_id || null,
      next_token: nextToken + 1,
      total_waiting: (count || 0) - 1,
      total_served: (state?.total_served || 0) + 1,
      last_called_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (state) {
      await (supabase as any)
        .from("hms_queue_display_state")
        .update(updateData)
        .eq("id", state.id);
    } else {
      await (supabase as any)
        .from("hms_queue_display_state")
        .insert({ ...updateData, config_id: configId, display_date: today, branch });
    }
  };

  const initializeQueue = async (configId: string) => {
    const existing = await (supabase as any)
      .from("hms_queue_display_state")
      .select("id")
      .eq("config_id", configId)
      .eq("display_date", today)
      .maybeSingle();

    if (!existing.data) {
      await (supabase as any)
        .from("hms_queue_display_state")
        .insert({
          config_id: configId,
          display_date: today,
          current_token: 0,
          total_waiting: 0,
          total_served: 0,
          avg_wait_min: 10,
          branch,
        });
    }
  };

  return { queueStates, loading, callNextToken, initializeQueue, loadStates };
}
