import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { CalendarCheck, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

const OUTCOMES = [
  { val: "better", label: "Better", icon: TrendingUp, color: "text-[hsl(142_55%_60%)]" },
  { val: "worse", label: "Worse", icon: TrendingDown, color: "text-[hsl(0_70%_65%)]" },
  { val: "unchanged", label: "Unchanged", icon: Minus, color: "text-[hsl(45_40%_60%)]" },
  { val: "old_symptoms_return", label: "Old symptoms return", icon: RefreshCw, color: "text-[hsl(45_85%_65%)]" },
];

const FollowUp = () => {
  const [params] = useSearchParams();
  const caseId = params.get("case");
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>(caseId ?? "");
  const [outcome, setOutcome] = useState("better");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("homeo_cases")
        .select("id, case_date, chief_complaint, patient:homeo_patients(full_name)")
        .order("case_date", { ascending: false })
        .limit(50);
      setCases(data ?? []);
    };
    load();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedCase) return setHistory([]);
      const { data } = await supabase
        .from("homeo_followups")
        .select("*")
        .eq("case_id", selectedCase)
        .order("followup_date", { ascending: false });
      setHistory(data ?? []);
    };
    loadHistory();
  }, [selectedCase]);

  const save = async () => {
    if (!selectedCase) return toast.error("Pick a case");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const c = cases.find((x) => x.id === selectedCase);
    const { error } = await supabase.from("homeo_followups").insert({
      case_id: selectedCase,
      patient_id: c?.patient_id ?? (await supabase.from("homeo_cases").select("patient_id").eq("id", selectedCase).single()).data?.patient_id,
      doctor_user_id: u.user!.id,
      outcome,
      notes,
      next_action: nextAction,
      next_followup_date: nextDate || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Follow-up recorded");
    setNotes("");
    setNextAction("");
    setNextDate("");
    const { data } = await supabase.from("homeo_followups").select("*").eq("case_id", selectedCase).order("followup_date", { ascending: false });
    setHistory(data ?? []);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className={t.label}>Follow-up Tracker</p>
        <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Track patient progress</h2>
      </div>

      <div className={`${t.card} p-5 space-y-4`}>
        <div>
          <label className={t.label}>Case</label>
          <select className={`${t.input} mt-1`} value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)}>
            <option value="">Select a case…</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.patient?.full_name ?? "—"} · {c.chief_complaint?.slice(0, 40)} · {new Date(c.case_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={t.label}>Outcome</label>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            {OUTCOMES.map((o) => {
              const Icon = o.icon;
              const active = outcome === o.val;
              return (
                <button key={o.val} onClick={() => setOutcome(o.val)} className={`${t.card} p-3 text-left transition ${active ? "border-[hsl(45_85%_55%/0.6)] bg-[hsl(45_85%_55%/0.1)]" : ""}`}>
                  <Icon className={`h-5 w-5 ${o.color}`} />
                  <p className="mt-1 text-sm font-medium">{o.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={t.label}>Notes (changes, new symptoms, response)</label>
          <textarea className={`${t.input} mt-1 min-h-[100px]`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={t.label}>Next action</label>
            <input className={`${t.input} mt-1`} value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="e.g. Wait & watch, repeat dose" />
          </div>
          <div>
            <label className={t.label}>Next follow-up date</label>
            <input type="date" className={`${t.input} mt-1`} value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </div>
        </div>

        <button onClick={save} disabled={saving || !selectedCase} className={t.primaryBtn}>
          <CalendarCheck className="h-4 w-4" /> {saving ? "Saving…" : "Record Follow-up"}
        </button>
      </div>

      {history.length > 0 && (
        <div className={`${t.card} p-5`}>
          <h3 className={`font-display text-lg ${t.goldText} mb-3`}>Follow-up timeline</h3>
          <ol className="space-y-3">
            {history.map((h) => {
              const o = OUTCOMES.find((x) => x.val === h.outcome);
              const Icon = o?.icon ?? Minus;
              return (
                <li key={h.id} className="flex gap-3 border-l-2 border-[hsl(45_85%_55%/0.3)] pl-4">
                  <Icon className={`h-5 w-5 ${o?.color}`} />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className={`font-semibold ${o?.color}`}>{o?.label}</span>
                      <span className={`ml-2 text-xs ${t.mutedText}`}>{new Date(h.followup_date).toLocaleString()}</span>
                    </p>
                    {h.notes && <p className={`mt-1 text-sm ${t.mutedText}`}>{h.notes}</p>}
                    {h.next_action && <p className="mt-1 text-xs">→ {h.next_action} {h.next_followup_date && `(by ${new Date(h.next_followup_date).toLocaleDateString()})`}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
};

export default FollowUp;
