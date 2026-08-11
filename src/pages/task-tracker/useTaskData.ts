import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTaskStore } from "./useTaskStore";
import type { VariableTask, RecurringTask, ScheduleOccurrence, TaskTrackerSettings, RoleContext } from "./types";
import { getDefaultSettings, getDecision } from "./types";

/**
 * Unified Task Data Hook
 * - Tries Supabase first (real persistence)
 * - Falls back to local state (useTaskStore) if not authenticated or tables don't exist
 * - Seamless switch — components don't know the difference
 */
export function useTaskData(roleContext: RoleContext = "general") {
  const localStore = useTaskStore();
  const [useSupabase, setUseSupabase] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase state
  const [sbTasks, setSbTasks] = useState<VariableTask[]>([]);
  const [sbRecurring, setSbRecurring] = useState<RecurringTask[]>([]);
  const [sbSchedule, setSbSchedule] = useState<ScheduleOccurrence[]>([]);
  const [sbSettings, setSbSettings] = useState<TaskTrackerSettings | null>(null);

  // Check if user is authenticated and table exists
  useEffect(() => {
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const uid = session.session?.user.id;
        if (!uid) { setLoading(false); return; }
        setUserId(uid);

        // Try to query — if table doesn't exist, fallback to local
        const { data, error } = await (supabase as any)
          .from("task_tracker_tasks")
          .select("id")
          .eq("user_id", uid)
          .limit(1);

        if (!error) {
          setUseSupabase(true);
          await loadAllFromSupabase(uid);
        }
      } catch {
        // Silent fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load all data from Supabase
  const loadAllFromSupabase = async (uid: string) => {
    try {
      // Tasks
      const { data: tasks } = await (supabase as any)
        .from("task_tracker_tasks")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (tasks) setSbTasks(tasks);

      // Recurring
      const { data: recurring } = await (supabase as any)
        .from("task_tracker_recurring")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (recurring) setSbRecurring(recurring);

      // Schedule
      const { data: schedule } = await (supabase as any)
        .from("task_tracker_schedule")
        .select("*, task_tracker_recurring(task_name, description, priority, person_in_charge)")
        .eq("user_id", uid)
        .order("occurrence_date", { ascending: true });
      if (schedule) {
        setSbSchedule(schedule.map((s: any) => ({
          ...s,
          task_name: s.task_tracker_recurring?.task_name || "",
          description: s.task_tracker_recurring?.description || "",
          priority: s.task_tracker_recurring?.priority || "Medium",
          person_in_charge: s.task_tracker_recurring?.person_in_charge || "",
        })));
      }

      // Settings
      const { data: settings } = await (supabase as any)
        .from("task_tracker_settings")
        .select("*")
        .eq("user_id", uid)
        .eq("role_context", "general")
        .maybeSingle();
      if (settings) setSbSettings(settings);
    } catch {
      // If any query fails, data stays empty (not a critical error)
    }
  };

  // === TASK CRUD (Supabase version) ===
  const sbAddTask = useCallback(async (task: any) => {
    if (!userId) return;
    const { data, error } = await (supabase as any)
      .from("task_tracker_tasks")
      .insert({ ...task, user_id: userId, role_context: roleContext })
      .select()
      .single();
    if (!error && data) setSbTasks(prev => [data, ...prev]);
  }, [userId, roleContext]);

  const sbUpdateTask = useCallback(async (id: string, updates: Partial<VariableTask>) => {
    const cleanUpdates = { ...updates } as any;
    delete cleanUpdates.decision; // Generated column — can't update
    delete cleanUpdates.id;
    delete cleanUpdates.user_id;
    delete cleanUpdates.created_at;

    if (cleanUpdates.is_completed && !cleanUpdates.completed_at) {
      cleanUpdates.completed_at = new Date().toISOString();
      cleanUpdates.progress = 100;
      cleanUpdates.status = "Completed";
    }

    const { error } = await (supabase as any)
      .from("task_tracker_tasks")
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setSbTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, decision: getDecision(updates.importance || t.importance, updates.urgency || t.urgency) } : t));
    }
  }, []);

  const sbDeleteTask = useCallback(async (id: string) => {
    await (supabase as any).from("task_tracker_tasks").delete().eq("id", id);
    setSbTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // === RECURRING CRUD ===
  const sbAddRecurring = useCallback(async (task: any) => {
    if (!userId) return;
    const { data, error } = await (supabase as any)
      .from("task_tracker_recurring")
      .insert({ ...task, user_id: userId, role_context: roleContext })
      .select()
      .single();
    if (!error && data) setSbRecurring(prev => [data, ...prev]);
  }, [userId, roleContext]);

  const sbUpdateRecurring = useCallback(async (id: string, updates: Partial<RecurringTask>) => {
    const cleanUpdates = { ...updates } as any;
    delete cleanUpdates.id;
    delete cleanUpdates.user_id;
    delete cleanUpdates.created_at;
    await (supabase as any).from("task_tracker_recurring").update({ ...cleanUpdates, updated_at: new Date().toISOString() }).eq("id", id);
    setSbRecurring(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const sbDeleteRecurring = useCallback(async (id: string) => {
    await (supabase as any).from("task_tracker_recurring").delete().eq("id", id);
    setSbRecurring(prev => prev.filter(t => t.id !== id));
  }, []);

  // === SCHEDULE ===
  const sbGenerateSchedule = useCallback(async () => {
    if (!userId) return;
    // Delete existing
    await (supabase as any).from("task_tracker_schedule").delete().eq("user_id", userId);

    const endRange = new Date();
    endRange.setMonth(endRange.getMonth() + 3);
    const rows: any[] = [];

    for (const rt of sbRecurring) {
      if (!rt.is_active) continue;
      let current = new Date(rt.first_date);
      const end = rt.end_date ? new Date(rt.end_date) : endRange;

      while (current <= end && current <= endRange) {
        rows.push({
          user_id: userId,
          recurring_task_id: rt.id,
          occurrence_date: current.toISOString().split("T")[0],
          decision: getDecision(rt.importance, rt.urgency),
        });
        switch (rt.frequency) {
          case "Daily": current.setDate(current.getDate() + 1); break;
          case "Every Week": current.setDate(current.getDate() + 7); break;
          case "Every 2 Weeks": current.setDate(current.getDate() + 14); break;
          case "Every Month": current.setMonth(current.getMonth() + 1); break;
          case "Every 2 Months": current.setMonth(current.getMonth() + 2); break;
          case "Every 3 Months": current.setMonth(current.getMonth() + 3); break;
          case "Every 4 Weeks": current.setDate(current.getDate() + 28); break;
          case "Every 6 Months": current.setMonth(current.getMonth() + 6); break;
          case "Yearly": current.setFullYear(current.getFullYear() + 1); break;
        }
      }
    }

    // Insert in batches
    for (let i = 0; i < rows.length; i += 100) {
      await (supabase as any).from("task_tracker_schedule").insert(rows.slice(i, i + 100));
    }

    // Reload
    await loadAllFromSupabase(userId);
  }, [userId, sbRecurring]);

  const sbMarkScheduleDone = useCallback(async (id: string) => {
    await (supabase as any).from("task_tracker_schedule").update({ is_done: true, done_at: new Date().toISOString() }).eq("id", id);
    setSbSchedule(prev => prev.map(s => s.id === id ? { ...s, is_done: true, done_at: new Date().toISOString() } : s));
  }, []);

  // === SETTINGS ===
  const sbUpdateSettings = useCallback(async (updates: Partial<TaskTrackerSettings>) => {
    if (!userId || !sbSettings) return;
    await (supabase as any).from("task_tracker_settings").update(updates).eq("id", sbSettings.id);
    setSbSettings(prev => prev ? { ...prev, ...updates } : prev);
  }, [userId, sbSettings]);

  // === RETURN: Supabase or Local ===
  if (useSupabase) {
    return {
      tasks: sbTasks,
      recurringTasks: sbRecurring,
      schedule: sbSchedule,
      settings: sbSettings || localStore.settings,
      addTask: sbAddTask,
      updateTask: sbUpdateTask,
      deleteTask: sbDeleteTask,
      addRecurring: sbAddRecurring,
      updateRecurring: sbUpdateRecurring,
      deleteRecurring: sbDeleteRecurring,
      generateSchedule: sbGenerateSchedule,
      markScheduleDone: sbMarkScheduleDone,
      updateSettings: sbUpdateSettings,
      isLoading: loading,
      isPersistent: true,
    };
  }

  // Fallback: local state
  return {
    ...localStore,
    isLoading: loading,
    isPersistent: false,
  };
}
