import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IndentStatus = "pending" | "approved" | "fulfilled" | "rejected";

export interface Indent {
  id: string;
  indentNo: string;
  department: string;
  raisedBy: string;
  date: string;
  items: number;
  status: IndentStatus;
  urgency: string;
}

const MOCK_INDENTS: Indent[] = [
  { id: "1", indentNo: "IND-2026-0145", department: "Panchakarma", raisedBy: "Suresh T", date: "2026-08-07", items: 5, status: "pending", urgency: "Normal" },
  { id: "2", indentNo: "IND-2026-0144", department: "Laboratory", raisedBy: "Anita D", date: "2026-08-06", items: 8, status: "approved", urgency: "Urgent" },
  { id: "3", indentNo: "IND-2026-0143", department: "IPD Ward", raisedBy: "Nurse Priya", date: "2026-08-05", items: 12, status: "fulfilled", urgency: "Normal" },
  { id: "4", indentNo: "IND-2026-0142", department: "OPD", raisedBy: "Rajesh K", date: "2026-08-04", items: 3, status: "fulfilled", urgency: "Normal" },
  { id: "5", indentNo: "IND-2026-0141", department: "Pharmacy", raisedBy: "Vikram R", date: "2026-08-03", items: 20, status: "approved", urgency: "Urgent" },
];

export const useIndent = () => {
  const [indents, setIndents] = useState<Indent[]>(MOCK_INDENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_indents")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: Indent[] = data.map((r: any) => ({
          id: r.id, indentNo: r.indent_no || "", department: r.department || "",
          raisedBy: r.raised_by || "", date: r.date || "",
          items: r.items_count || 0, status: r.status || "pending",
          urgency: r.urgency || "Normal",
        }));
        setIndents(mapped);
      }
      setLoading(false);
    } catch (err: any) { setError(err.message); setLoading(false); }
  }, []);

  useEffect(() => { fetchIndents(); }, [fetchIndents]);

  const updateStatus = async (id: string, status: IndentStatus): Promise<boolean> => {
    const { error: updateErr } = await (supabase as any).from("hms_indents").update({ status }).eq("id", id);
    if (updateErr) {
      setIndents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      return true;
    }
    await fetchIndents();
    return true;
  };

  const createIndent = async (indent: Omit<Indent, "id" | "indentNo" | "status">): Promise<boolean> => {
    const payload = {
      indent_no: `IND-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      department: indent.department, raised_by: indent.raisedBy,
      items_count: indent.items, urgency: indent.urgency, status: "pending",
    };
    const { error: insertErr } = await (supabase as any).from("hms_indents").insert(payload);
    if (insertErr) {
      setIndents(prev => [{ ...indent, id: `IN-${Date.now()}`, indentNo: payload.indent_no, status: "pending" }, ...prev]);
      return true;
    }
    await fetchIndents();
    return true;
  };

  const pendingCount = indents.filter(i => i.status === "pending").length;
  const fulfilledCount = indents.filter(i => i.status === "fulfilled").length;

  return { indents, loading, error, pendingCount, fulfilledCount, updateStatus, createIndent, refetch: fetchIndents };
};
