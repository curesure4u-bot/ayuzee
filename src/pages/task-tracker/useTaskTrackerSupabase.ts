import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type {
  VariableTask, RecurringTask, ScheduleOccurrence,
  TaskTrackerSettings, RoleContext, Habit, JournalEntry,
} from "./types";
import { getDefaultSettings, getDecision } from "./types";

// ============================================================
// AUTH HELPER
// ============================================================
function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return userId;
}

// ============================================================
// SETTINGS
// ============================================================
export function useTaskTrackerSettings(roleContext: RoleContext) {
  const userId = useUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["task-tracker-settings", userId, roleContext],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await (supabase as any)
        .from("task_tracker_settings")
        .select("*")
        .eq("user_id", userId)
        .eq("role_context", roleContext)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        // Create default settings
        const defaults = getDefaultSettings(roleContext);
        const { data: created, error: insertErr } = await (supabase as any)
          .from("task_tracker_settings")
          .insert({
            user_id: userId,
            role_context: roleContext,
            statuses: defaults.statuses,
            kanban_categories: defaults.kanban_categories,
            people_in_charge: defaults.people_in_charge,
            working_days: defaults.working_days,
            holidays: defaults.holidays || [],
            theme: "light",
          })
          .select()
          .single();
        if (insertErr) throw insertErr;
        return created as TaskTrackerSettings;
      }
      return data as TaskTrackerSettings;
    },
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<TaskTrackerSettings>) => {
      if (!userId || !query.data) throw new Error("No session");
      const { error } = await (supabase as any)
        .from("task_tracker_settings")
        .update(updates)
        .eq("id", query.data.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-settings"] }),
  });

  return { settings: query.data, isLoading: query.isLoading, updateSettings: updateMutation.mutate };
}

// ============================================================
// VARIABLE TASKS
// ============================================================
export function useVariableTasks(roleContext: RoleContext) {
  const userId = useUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["task-tracker-tasks", userId, roleContext],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("task_tracker_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("role_context", roleContext)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as VariableTask[];
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async (task: Omit<VariableTask, "id" | "user_id" | "decision" | "created_at" | "updated_at">) => {
      if (!userId) throw new Error("No session");
      const { error } = await (supabase as any)
        .from("task_tracker_tasks")
        .insert({ ...task, user_id: userId, role_context: roleContext });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-tasks"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VariableTask> }) => {
      const { error } = await (supabase as any)
        .from("task_tracker_tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("task_tracker_tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-tasks"] }),
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    addTask: addMutation.mutate,
    updateTask: (id: string, updates: Partial<VariableTask>) => updateMutation.mutate({ id, updates }),
    deleteTask: deleteMutation.mutate,
  };
}

// ============================================================
// RECURRING TASKS
// ============================================================
export function useRecurringTasks(roleContext: RoleContext) {
  const userId = useUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["task-tracker-recurring", userId, roleContext],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("task_tracker_recurring")
        .select("*")
        .eq("user_id", userId)
        .eq("role_context", roleContext)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as RecurringTask[];
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async (task: Omit<RecurringTask, "id" | "user_id" | "created_at">) => {
      if (!userId) throw new Error("No session");
      const { error } = await (supabase as any)
        .from("task_tracker_recurring")
        .insert({ ...task, user_id: userId, role_context: roleContext });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-recurring"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RecurringTask> }) => {
      const { error } = await (supabase as any)
        .from("task_tracker_recurring")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-recurring"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("task_tracker_recurring")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-recurring"] }),
  });

  return {
    recurringTasks: query.data || [],
    isLoading: query.isLoading,
    addRecurring: addMutation.mutate,
    updateRecurring: (id: string, updates: Partial<RecurringTask>) => updateMutation.mutate({ id, updates }),
    deleteRecurring: deleteMutation.mutate,
  };
}

// ============================================================
// SCHEDULE (generated occurrences)
// ============================================================
export function useTaskSchedule(roleContext: RoleContext) {
  const userId = useUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["task-tracker-schedule", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("task_tracker_schedule")
        .select("*, task_tracker_recurring(task_name, description, priority, person_in_charge)")
        .eq("user_id", userId)
        .order("occurrence_date", { ascending: true });
      if (error) throw error;
      // Flatten joined data
      return (data || []).map((s: any) => ({
        ...s,
        task_name: s.task_tracker_recurring?.task_name || "",
        description: s.task_tracker_recurring?.description || "",
        priority: s.task_tracker_recurring?.priority || "Medium",
        person_in_charge: s.task_tracker_recurring?.person_in_charge || "",
      })) as ScheduleOccurrence[];
    },
    enabled: !!userId,
  });

  const generateMutation = useMutation({
    mutationFn: async (recurringTasks: RecurringTask[]) => {
      if (!userId) throw new Error("No session");

      // Delete existing schedule for this user
      await (supabase as any)
        .from("task_tracker_schedule")
        .delete()
        .eq("user_id", userId);

      // Generate new occurrences
      const endRange = new Date();
      endRange.setMonth(endRange.getMonth() + 3);
      const rows: any[] = [];

      for (const rt of recurringTasks) {
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

      // Insert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await (supabase as any).from("task_tracker_schedule").insert(batch);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-schedule"] }),
  });

  const markDoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("task_tracker_schedule")
        .update({ is_done: true, done_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-schedule"] }),
  });

  return {
    schedule: query.data || [],
    isLoading: query.isLoading,
    generateSchedule: generateMutation.mutate,
    markScheduleDone: markDoneMutation.mutate,
  };
}

// ============================================================
// HABITS
// ============================================================
export function useHabits(roleContext: RoleContext) {
  const userId = useUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["task-tracker-habits", userId, roleContext],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("task_tracker_habits")
        .select("*")
        .eq("user_id", userId)
        .eq("role_context", roleContext)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Habit[];
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async (habit: Omit<Habit, "id" | "user_id" | "current_streak" | "longest_streak" | "created_at">) => {
      if (!userId) throw new Error("No session");
      const { error } = await (supabase as any)
        .from("task_tracker_habits")
        .insert({ ...habit, user_id: userId, role_context: roleContext });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-habits"] }),
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) => {
      if (!userId) throw new Error("No session");
      if (completed) {
        const { error } = await (supabase as any)
          .from("task_tracker_habit_log")
          .insert({ habit_id: habitId, user_id: userId, completed_date: date });
        if (error && !error.message?.includes("duplicate")) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("task_tracker_habit_log")
          .delete()
          .eq("habit_id", habitId)
          .eq("completed_date", date);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-habits", "task-tracker-habit-log"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("task_tracker_habits")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-habits"] }),
  });

  return {
    habits: query.data || [],
    isLoading: query.isLoading,
    addHabit: addMutation.mutate,
    toggleCompletion: toggleCompletionMutation.mutate,
    deleteHabit: deleteMutation.mutate,
  };
}

// ============================================================
// HABIT LOG (for calendar display)
// ============================================================
export function useHabitLog(habitId: string | null) {
  const userId = useUserId();

  return useQuery({
    queryKey: ["task-tracker-habit-log", habitId],
    queryFn: async () => {
      if (!userId || !habitId) return [];
      const { data, error } = await (supabase as any)
        .from("task_tracker_habit_log")
        .select("completed_date")
        .eq("habit_id", habitId)
        .eq("user_id", userId)
        .order("completed_date", { ascending: false })
        .limit(90); // Last 90 days
      if (error) throw error;
      return (data || []).map((d: any) => d.completed_date as string);
    },
    enabled: !!userId && !!habitId,
  });
}

// ============================================================
// JOURNAL
// ============================================================
export function useJournal(roleContext: RoleContext) {
  const userId = useUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["task-tracker-journal", userId, roleContext],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await (supabase as any)
        .from("task_tracker_journal")
        .select("*")
        .eq("user_id", userId)
        .eq("role_context", roleContext)
        .order("entry_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data || []) as JournalEntry[];
    },
    enabled: !!userId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (entry: { entry_date: string; content: string; mood: string }) => {
      if (!userId) throw new Error("No session");
      const { error } = await (supabase as any)
        .from("task_tracker_journal")
        .upsert(
          { ...entry, user_id: userId, role_context: roleContext },
          { onConflict: "user_id,entry_date" }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-journal"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("task_tracker_journal")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task-tracker-journal"] }),
  });

  return {
    entries: query.data || [],
    isLoading: query.isLoading,
    upsertEntry: upsertMutation.mutate,
    deleteEntry: deleteMutation.mutate,
  };
}
