import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TokenStatus = "waiting" | "serving" | "completed" | "skipped";

export interface QueueToken {
  id: string;
  tokenNo: string;
  patient: string;
  doctor: string;
  department: string;
  time: string;
  status: TokenStatus;
  estimatedWait: string;
}

const MOCK_TOKENS: QueueToken[] = [
  { id: "1", tokenNo: "A-012", patient: "Ramesh Kumar", doctor: "Dr. Sharma", department: "Ayurveda", time: "10:15 AM", status: "serving", estimatedWait: "Now" },
  { id: "2", tokenNo: "A-013", patient: "Lakshmi Devi", doctor: "Dr. Sharma", department: "Ayurveda", time: "10:30 AM", status: "waiting", estimatedWait: "~15 min" },
  { id: "3", tokenNo: "A-014", patient: "Sunil Menon", doctor: "Dr. Sharma", department: "Ayurveda", time: "10:45 AM", status: "waiting", estimatedWait: "~30 min" },
  { id: "4", tokenNo: "P-005", patient: "Meera Nair", doctor: "Dr. Patel", department: "Panchakarma", time: "10:00 AM", status: "serving", estimatedWait: "Now" },
  { id: "5", tokenNo: "P-006", patient: "Anand Sharma", doctor: "Dr. Patel", department: "Panchakarma", time: "10:30 AM", status: "waiting", estimatedWait: "~20 min" },
  { id: "6", tokenNo: "H-003", patient: "Priya Mohan", doctor: "Dr. Das", department: "Homeopathy", time: "10:00 AM", status: "completed", estimatedWait: "—" },
];

export const useQueueDisplay = () => {
  const [tokens, setTokens] = useState<QueueToken[]>(MOCK_TOKENS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_queue_tokens")
        .select("*")
        .eq("queue_date", today)
        .order("token_no");

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }
      if (data && data.length > 0) {
        setTokens(data.map((t: any) => ({
          id: t.id, tokenNo: t.token_no || "", patient: t.patient_name || "",
          doctor: t.doctor_name || "", department: t.department || "",
          time: t.scheduled_time || "", status: t.status || "waiting",
          estimatedWait: t.estimated_wait || "",
        })));
      }
      setLoading(false);
    } catch (err: any) { setError(err.message); setLoading(false); }
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const callNext = async (id: string): Promise<boolean> => {
    const { error: e } = await (supabase as any).from("hms_queue_tokens").update({ status: "serving" }).eq("id", id);
    if (e) { setTokens(prev => prev.map(t => t.id === id ? { ...t, status: "serving" as TokenStatus } : t)); return true; }
    await fetchTokens(); return true;
  };

  const serving = tokens.filter(t => t.status === "serving").length;
  const waiting = tokens.filter(t => t.status === "waiting").length;
  const completed = tokens.filter(t => t.status === "completed").length;

  return { tokens, loading, error, serving, waiting, completed, callNext, refetch: fetchTokens };
};
