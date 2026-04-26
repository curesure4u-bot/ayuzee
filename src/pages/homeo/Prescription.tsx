import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Pill, Save } from "lucide-react";

const POTENCIES = ["6C", "30C", "200C", "1M", "10M", "50M", "CM", "3X", "6X", "12X", "30X", "Q (Mother)"];
const DOSAGES = ["Single dose", "BD x 3 days", "TDS x 5 days", "OD x 7 days", "Weekly x 4", "Monthly x 3", "SOS"];

type Row = { remedy_id: string; remedy_name: string; potency: string; dosage: string; instructions: string };

const Prescription = () => {
  const [params] = useSearchParams();
  const caseId = params.get("case");
  const [caseData, setCaseData] = useState<any>(null);
  const [remedies, setRemedies] = useState<any[]>([]);
  const [list, setList] = useState<Row[]>([{ remedy_id: "", remedy_name: "", potency: "30C", dosage: "Single dose", instructions: "" }]);
  const [advice, setAdvice] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [durationDays, setDurationDays] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    if (!caseId) return;
    const { data: rx } = await supabase.from("homeo_prescriptions").select("*").eq("case_id", caseId).order("prescribed_at", { ascending: false });
    setHistory(rx ?? []);
  };

  useEffect(() => {
    const load = async () => {
      const { data: rem } = await supabase.from("homeo_remedies").select("id, name, abbreviation").order("name").limit(500);
      setRemedies(rem ?? []);
      if (caseId) {
        const { data: c } = await supabase.from("homeo_cases").select("*, patient:homeo_patients(*)").eq("id", caseId).single();
        setCaseData(c);
        await loadHistory();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const updateRow = (i: number, key: keyof Row, val: string) => {
    const copy = [...list];
    copy[i] = { ...copy[i], [key]: val };
    if (key === "remedy_id") {
      const r = remedies.find((x) => x.id === val);
      copy[i].remedy_name = r ? `${r.name} (${r.abbreviation})` : "";
    }
    setList(copy);
  };

  const save = async () => {
    if (!caseId || !caseData) return toast.error("Open from a case to save prescription");
    const valid = list.filter((r) => r.remedy_id);
    if (!valid.length) return toast.error("Select at least one remedy");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const rows = valid.map((r) => ({
      case_id: caseId,
      patient_id: caseData.patient_id,
      doctor_user_id: u.user!.id,
      remedy_id: r.remedy_id,
      remedy_name: r.remedy_name,
      potency: r.potency,
      dosage: r.dosage,
      instructions: [r.instructions, advice].filter(Boolean).join(" — "),
      duration_days: durationDays ? parseInt(durationDays, 10) : null,
      follow_up_date: followupDate || null,
    }));
    const { error } = await supabase.from("homeo_prescriptions").insert(rows);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Prescription saved");
    setList([{ remedy_id: "", remedy_name: "", potency: "30C", dosage: "Single dose", instructions: "" }]);
    await loadHistory();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className={t.label}>Prescription Generator</p>
          <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">
            {caseData?.patient?.full_name ? `Rx for ${caseData.patient.full_name}` : "New Prescription"}
          </h2>
          {caseData?.patient && <p className={`mt-1 text-sm ${t.mutedText}`}>{caseData.patient.age} y · {caseData.patient.gender} · {caseData.chief_complaint}</p>}
        </div>
        {caseId && <Link to={`/homeo/reports?case=${caseId}`} className={t.ghostBtn}>📄 Export PDF</Link>}
      </div>

      <div className={`${t.card} p-5 space-y-4`}>
        <div>
          <label className={t.label}>Remedies</label>
          <div className="mt-2 space-y-3">
            {list.map((row, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-12">
                <select className={`${t.input} md:col-span-4`} value={row.remedy_id} onChange={(e) => updateRow(i, "remedy_id", e.target.value)}>
                  <option value="">Select remedy…</option>
                  {remedies.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.abbreviation})</option>)}
                </select>
                <select className={`${t.input} md:col-span-2`} value={row.potency} onChange={(e) => updateRow(i, "potency", e.target.value)}>
                  {POTENCIES.map((p) => <option key={p}>{p}</option>)}
                </select>
                <select className={`${t.input} md:col-span-3`} value={row.dosage} onChange={(e) => updateRow(i, "dosage", e.target.value)}>
                  {DOSAGES.map((p) => <option key={p}>{p}</option>)}
                </select>
                <input className={`${t.input} md:col-span-3`} placeholder="Instructions" value={row.instructions} onChange={(e) => updateRow(i, "instructions", e.target.value)} />
              </div>
            ))}
            <button onClick={() => setList([...list, { remedy_id: "", remedy_name: "", potency: "30C", dosage: "Single dose", instructions: "" }])} className={t.ghostBtn}>+ Add row</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className={t.label}>General advice (diet, lifestyle)</label>
            <textarea className={`${t.input} mt-1 min-h-[80px]`} value={advice} onChange={(e) => setAdvice(e.target.value)} />
          </div>
          <div className="space-y-3">
            <div>
              <label className={t.label}>Duration (days)</label>
              <input type="number" className={`${t.input} mt-1`} value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="e.g. 7" />
            </div>
            <div>
              <label className={t.label}>Follow-up date</label>
              <input type="date" className={`${t.input} mt-1`} value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} />
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} className={t.primaryBtn}>
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Prescription"}
        </button>
      </div>

      {history.length > 0 && (
        <div className={`${t.card} p-5`}>
          <h3 className={`font-display text-lg ${t.goldText} mb-3`}><Pill className="inline h-4 w-4" /> Past prescriptions</h3>
          <ul className="divide-y divide-[hsl(45_40%_55%/0.12)]">
            {history.map((h) => (
              <li key={h.id} className="py-3 text-sm">
                <span className={t.goldText}>{h.remedy_name}</span> · {h.potency} · {h.dosage}
                <span className={`ml-2 ${t.mutedText} text-xs`}>{new Date(h.prescribed_at).toLocaleString()}</span>
                {h.instructions && <p className={`text-xs ${t.mutedText} mt-0.5`}>{h.instructions}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Prescription;
