import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching QueueAnalytics UI ────────────────────────────────────────

export interface QueueStats {
  queueDepth: number;
  avgWaitMinutes: number;
  seenToday: number;
  avgConsultationMinutes: number;
  peakHour: string;
  longestWaitMinutes: number;
}

export interface WaitingPatient {
  id: string;
  name: string;
  token: string;
  waitMinutes: number;
  alert: boolean;
  priority: string;
  visitType: string;
  checkInTime: string;
}

export interface HourlyLoad {
  hour: string;
  level: "high" | "medium" | "low";
  count: number;
}

export interface SatisfactionBucket {
  wait: string;
  satisfaction: number;
}

export interface QueueAnalyticsData {
  stats: QueueStats;
  waitingPatients: WaitingPatient[];
  hourlyLoad: HourlyLoad[];
  satisfactionData: SatisfactionBucket[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_STATS: QueueStats = {
  queueDepth: 5,
  avgWaitMinutes: 18,
  seenToday: 32,
  avgConsultationMinutes: 12,
  peakHour: "8-10 AM",
  longestWaitMinutes: 28,
};

const MOCK_WAITING: WaitingPatient[] = [
  { id: "1", name: "Rajesh Kumar", token: "T-033", waitMinutes: 28, alert: true, priority: "normal", visitType: "appointment", checkInTime: "" },
  { id: "2", name: "Anita Sharma", token: "T-034", waitMinutes: 26, alert: true, priority: "normal", visitType: "walk_in", checkInTime: "" },
  { id: "3", name: "Vikram Patel", token: "T-035", waitMinutes: 14, alert: false, priority: "normal", visitType: "follow_up", checkInTime: "" },
  { id: "4", name: "Meera Joshi", token: "T-036", waitMinutes: 8, alert: false, priority: "normal", visitType: "appointment", checkInTime: "" },
  { id: "5", name: "Suresh Nair", token: "T-037", waitMinutes: 3, alert: false, priority: "normal", visitType: "walk_in", checkInTime: "" },
];

const MOCK_HOURLY: HourlyLoad[] = [
  { hour: "8AM", level: "high", count: 8 },
  { hour: "9AM", level: "high", count: 9 },
  { hour: "10AM", level: "high", count: 7 },
  { hour: "11AM", level: "medium", count: 5 },
  { hour: "12PM", level: "low", count: 2 },
  { hour: "1PM", level: "low", count: 1 },
  { hour: "2PM", level: "medium", count: 4 },
  { hour: "3PM", level: "medium", count: 5 },
  { hour: "4PM", level: "high", count: 6 },
  { hour: "5PM", level: "medium", count: 4 },
  { hour: "6PM", level: "low", count: 2 },
];

const MOCK_SATISFACTION: SatisfactionBucket[] = [
  { wait: "< 10 min", satisfaction: 92 },
  { wait: "10-15 min", satisfaction: 85 },
  { wait: "15-20 min", satisfaction: 72 },
  { wait: "20-25 min", satisfaction: 58 },
  { wait: "> 25 min", satisfaction: 41 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
  if (h === 0) return "12AM";
  if (h < 12) return `${h}AM`;
  if (h === 12) return "12PM";
  return `${h - 12}PM`;
}

function getLoadLevel(count: number): "high" | "medium" | "low" {
  if (count >= 6) return "high";
  if (count >= 3) return "medium";
  return "low";
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useQueueAnalytics = (): QueueAnalyticsData & { refetch: () => void } => {
  const [data, setData] = useState<QueueAnalyticsData>({
    stats: MOCK_STATS,
    waitingPatients: MOCK_WAITING,
    hourlyLoad: MOCK_HOURLY,
    satisfactionData: MOCK_SATISFACTION,
    loading: true,
    error: null,
  });

  const fetchQueue = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      // Get doctor record to find doctor_id
      const { data: doctorRow } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      const doctorId = doctorRow?.id || uid;

      // Fetch today's queue entries
      const today = new Date().toISOString().split("T")[0];
      const { data: queueEntries, error } = await (supabase as any)
        .from("opd_queue_entries")
        .select("*")
        .eq("doctor_id", uid)
        .eq("queue_date", today)
        .order("check_in_time", { ascending: true });

      if (error) {
        console.warn("Queue analytics fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!queueEntries || queueEntries.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const now = new Date();
      const ALERT_THRESHOLD_MIN = 25;

      // ─── Waiting Patients ──────────────────────────────────────────

      const waiting = queueEntries.filter((e: any) => e.status === "waiting");
      const completed = queueEntries.filter((e: any) => e.status === "completed");

      const waitingPatients: WaitingPatient[] = waiting.map((e: any) => {
        const checkIn = new Date(e.check_in_time);
        const waitMinutes = Math.round((now.getTime() - checkIn.getTime()) / 60000);
        return {
          id: e.id,
          name: e.patient_name,
          token: e.token_number,
          waitMinutes,
          alert: waitMinutes >= ALERT_THRESHOLD_MIN,
          priority: e.priority || "normal",
          visitType: e.visit_type || "walk_in",
          checkInTime: checkIn.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        };
      }).sort((a: WaitingPatient, b: WaitingPatient) => b.waitMinutes - a.waitMinutes);

      // ─── Stats ─────────────────────────────────────────────────────

      const avgWait = waiting.length > 0
        ? Math.round(waiting.reduce((sum: number, e: any) => {
            return sum + (now.getTime() - new Date(e.check_in_time).getTime()) / 60000;
          }, 0) / waiting.length)
        : 0;

      const avgConsultation = completed.length > 0
        ? Math.round(completed
            .filter((e: any) => e.consultation_start_time && e.consultation_end_time)
            .reduce((sum: number, e: any) => {
              return sum + (new Date(e.consultation_end_time).getTime() - new Date(e.consultation_start_time).getTime()) / 60000;
            }, 0) / Math.max(completed.filter((e: any) => e.consultation_end_time).length, 1))
        : 12;

      const longestWait = waitingPatients.length > 0 ? waitingPatients[0].waitMinutes : 0;

      // ─── Hourly Load Heatmap ───────────────────────────────────────

      const hourCounts = new Map<number, number>();
      for (const entry of queueEntries) {
        const h = new Date(entry.check_in_time).getHours();
        hourCounts.set(h, (hourCounts.get(h) || 0) + 1);
      }

      const hourlyLoad: HourlyLoad[] = [];
      for (let h = 8; h <= 18; h++) {
        const count = hourCounts.get(h) || 0;
        hourlyLoad.push({ hour: formatHour(h), level: getLoadLevel(count), count });
      }

      // Find peak hour
      let peakHour = "8-10 AM";
      let maxCount = 0;
      for (const [h, count] of hourCounts) {
        if (count > maxCount) {
          maxCount = count;
          peakHour = `${formatHour(h)}`;
        }
      }

      const stats: QueueStats = {
        queueDepth: waiting.length,
        avgWaitMinutes: avgWait,
        seenToday: completed.length,
        avgConsultationMinutes: avgConsultation,
        peakHour,
        longestWaitMinutes: longestWait,
      };

      setData({
        stats,
        waitingPatients,
        hourlyLoad: hourlyLoad.length > 0 ? hourlyLoad : MOCK_HOURLY,
        satisfactionData: MOCK_SATISFACTION, // would need patient feedback data — keep static
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Queue analytics unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Real-time subscription for queue updates
  useEffect(() => {
    const channel = (supabase as any)
      .channel("opd-queue-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opd_queue_entries" },
        () => { fetchQueue(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQueue]);

  // Auto-refresh every 30 seconds for wait time updates
  useEffect(() => {
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  return { ...data, refetch: fetchQueue };
};
