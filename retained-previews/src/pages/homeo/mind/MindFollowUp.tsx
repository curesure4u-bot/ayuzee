import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "../lib/ui";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const Slider = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
  <div>
    <div className="flex items-center justify-between">
      <label className={t.label}>{label}</label>
      <span className="text-[hsl(45_85%_70%)] font-semibold text-sm">{value}/10</span>
    </div>
    <input type="range" min={0} max={10} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full mt-2 accent-[hsl(45_85%_55%)]" />
  </div>
);

const MindFollowUp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseRow, setCaseRow] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [scores, setScores] = useState({ trigger: 5, resilience: 5, sleep: 5, energy: 5, physical: 5 });
  const [form, setForm] = useState({ remedy_given: "", potency: "", observations: "", next_action: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("homeo_mind_cases").select("*").eq("id", id).maybeSingle();
      setCaseRow(c);
      setForm((p) => ({ ...p, remedy_given: c?.doctor_final_remedy || c?.suggested_remedy || "", potency: c?.potency || "" }));
      const { data: hist } = await supabase.from("homeo_mind_followups")
        .select("*").eq("case_id", id).order("visit_date", { ascending: false });
      setHistory(hist ?? []);
    })();
  }, [id]);

  const save = async () => {
    setSaving(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) { setSaving(false); return; }
    const { error } = await supabase.from("homeo_mind_followups").insert({
      case_id: id, doctor_user_id: uid,
      trigger_response_score: scores.trigger,
      emotional_resilience_score: scores.resilience,
      sleep_score: scores.sleep,
      energy_score: scores.energy,
      physical_complaint_score: scores.physical,
      ...form,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Follow-up recorded");
    navigate(`/homeo/mind/cases/${id}`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className={t.label}>Mind Case · Follow-up</p>
        <h1 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">
          {caseRow?.patient_name || "Patient"} — Follow-up visit
        </h1>
        <p className={`${t.mutedText} text-sm mt-1`}>
          Track how the remedy is working across mental, emotional, and physical layers.
        </p>
      </div>

      <div className={`${t.card} p-5 space-y-5`}>
        <Slider label="Trigger response improved? (0 worse → 10 fully resolved)" value={scores.trigger} onChange={(n) => setScores((p) => ({ ...p, trigger: n }))} />
        <Slider label="Emotional resilience" value={scores.resilience} onChange={(n) => setScores((p) => ({ ...p, resilience: n }))} />
        <Slider label="Sleep quality" value={scores.sleep} onChange={(n) => setScores((p) => ({ ...p, sleep: n }))} />
        <Slider label="Energy" value={scores.energy} onChange={(n) => setScores((p) => ({ ...p, energy: n }))} />
        <Slider label="Physical complaint relief" value={scores.physical} onChange={(n) => setScores((p) => ({ ...p, physical: n }))} />
      </div>

      <div className={`${t.card} p-5 space-y-3`}>
        <div className="grid gap-3 md:grid-cols-2">
          <input className={t.input} placeholder="Remedy given" value={form.remedy_given}
            onChange={(e) => setForm((p) => ({ ...p, remedy_given: e.target.value }))} />
          <input className={t.input} placeholder="Potency" value={form.potency}
            onChange={(e) => setForm((p) => ({ ...p, potency: e.target.value }))} />
        </div>
        <textarea className={`${t.input} min-h-[100px]`} placeholder="Observations — what shifted, new symptoms, returning of old…"
          value={form.observations} onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))} />
        <textarea className={`${t.input} min-h-[80px]`} placeholder="Next action — wait, repeat, change potency, change remedy…"
          value={form.next_action} onChange={(e) => setForm((p) => ({ ...p, next_action: e.target.value }))} />
      </div>

      <button onClick={save} disabled={saving} className={t.primaryBtn}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save follow-up</>}
      </button>

      {history.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-[hsl(45_85%_75%)] mb-3">Previous visits</h2>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className={`${t.card} p-3 text-sm`}>
                <p className={t.label}>{new Date(h.visit_date).toLocaleDateString()} · {h.remedy_given} {h.potency}</p>
                <p className="text-[hsl(45_30%_92%)] mt-1">
                  Trigger {h.trigger_response_score}/10 · Resilience {h.emotional_resilience_score}/10 · Sleep {h.sleep_score}/10 · Energy {h.energy_score}/10 · Physical {h.physical_complaint_score}/10
                </p>
                {h.observations && <p className={`${t.mutedText} mt-1`}>{h.observations}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MindFollowUp;
