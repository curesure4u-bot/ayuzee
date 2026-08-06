/**
 * Hook to manage Internship Journal —
 * CRUD journal entries and compute posting stats.
 * Persists to Supabase: internship_journal_entries
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type JournalEntry = {
  id: string;
  user_id: string;
  posting_date: string;
  department: string;
  hospital_name: string | null;
  supervisor_name: string | null;
  cases_seen: number;
  procedures_performed: string[];
  diagnosis_observed: string[];
  learnings: string;
  challenges: string | null;
  supervisor_feedback: string | null;
  hours_spent: number;
  created_at: string;
  updated_at: string;
};

export type JournalStats = {
  totalEntries: number;
  totalHours: number;
  totalCases: number;
  totalProcedures: number;
  departmentBreakdown: { department: string; entries: number; hours: number }[];
};

// ---------- Hook: useInternshipJournal ----------

export function useInternshipJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats>({
    totalEntries: 0,
    totalHours: 0,
    totalCases: 0,
    totalProcedures: 0,
    departmentBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const computeStats = (entryList: JournalEntry[]): JournalStats => {
    let totalHours = 0;
    let totalCases = 0;
    let totalProcedures = 0;
    const deptMap: Record<string, { entries: number; hours: number }> = {};

    entryList.forEach((e) => {
      totalHours += e.hours_spent || 0;
      totalCases += e.cases_seen || 0;
      totalProcedures += (e.procedures_performed || []).length;

      if (!deptMap[e.department]) deptMap[e.department] = { entries: 0, hours: 0 };
      deptMap[e.department].entries += 1;
      deptMap[e.department].hours += e.hours_spent || 0;
    });

    const departmentBreakdown = Object.entries(deptMap)
      .map(([department, data]) => ({ department, ...data }))
      .sort((a, b) => b.entries - a.entries);

    return { totalEntries: entryList.length, totalHours, totalCases, totalProcedures, departmentBreakdown };
  };

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    if (uid) {
      const { data } = await (supabase as any)
        .from("internship_journal_entries")
        .select("*")
        .eq("user_id", uid)
        .order("posting_date", { ascending: false });

      const entryList = (data || []) as JournalEntry[];
      setEntries(entryList);
      setStats(computeStats(entryList));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(
    async (entry: Omit<JournalEntry, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from("internship_journal_entries")
        .insert({ ...entry, user_id: userId })
        .select()
        .single();

      if (!error && data) {
        const updated = [data as JournalEntry, ...entries];
        setEntries(updated);
        setStats(computeStats(updated));
        return data;
      }
      return null;
    },
    [userId, entries]
  );

  const updateEntry = useCallback(
    async (entryId: string, updates: Partial<JournalEntry>) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("internship_journal_entries")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", entryId)
        .eq("user_id", userId);

      if (!error) {
        const updated = entries.map((e) => (e.id === entryId ? { ...e, ...updates } : e));
        setEntries(updated);
        setStats(computeStats(updated));
        return true;
      }
      return false;
    },
    [userId, entries]
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("internship_journal_entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", userId);

      if (!error) {
        const updated = entries.filter((e) => e.id !== entryId);
        setEntries(updated);
        setStats(computeStats(updated));
        return true;
      }
      return false;
    },
    [userId, entries]
  );

  return { entries, stats, loading, userId, createEntry, updateEntry, deleteEntry, refetch: fetchEntries };
}
