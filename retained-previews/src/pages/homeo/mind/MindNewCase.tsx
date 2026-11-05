import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "../lib/ui";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

const fields = [
  { key: "chief_complaint", label: "Chief complaint", placeholder: "Main reason patient sought consultation", area: false },
  { key: "duration", label: "Duration", placeholder: "How long has this been going on?", area: false },
  { key: "trigger_event", label: "Trigger event", placeholder: "When/why did it start? What happened around that time?", area: true },
  { key: "bothers_most", label: "What bothers you most?", placeholder: "In their own words — the worst part", area: true },
  { key: "reaction", label: "How did you react?", placeholder: "Pattern of response — silent, angry, withdrew, fought…", area: true },
  { key: "repeating_emotion", label: "What emotion repeats?", placeholder: "The feeling that keeps coming back", area: true },
  { key: "deepest_fear", label: "What do you fear?", placeholder: "Deepest fear — death, abandonment, failure, illness…", area: true },
  { key: "what_hurts", label: "What hurts deeply?", placeholder: "What wound never fully healed?", area: true },
  { key: "what_suppressed", label: "What do you suppress?", placeholder: "Feelings/expressions held in", area: true },
  { key: "relationship_pattern", label: "Pattern in relationships", placeholder: "Recurring dynamic with partners/family", area: true },
  { key: "work_pattern", label: "Pattern in work/life", placeholder: "Recurring conflict or theme at work", area: true },
] as const;

const MindNewCase = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState({ patient_name: "", patient_age: "", patient_gender: "" });
  const [form, setForm] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const analyze = async () => {
    if (!form.chief_complaint && !form.bothers_most && !form.repeating_emotion) {
      toast.error("Please fill at least the chief complaint and a couple of perception questions.");
      return;
    }
    setAnalyzing(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) { toast.error("Sign in required"); return; }

      const narrative = fields
        .map((f) => `${f.label}: ${form[f.key] ?? ""}`)
        .filter((s) => s.split(":")[1]?.trim())
        .join("\n\n");

      const { data: ai, error: aiErr } = await supabase.functions.invoke("homeo-mind-analyze", {
        body: { narrative },
      });
      if (aiErr) throw aiErr;
      if ((ai as any)?.error) throw new Error((ai as any).error);

      const insertPayload: any = {
        doctor_user_id: uid,
        patient_name: patient.patient_name || null,
        patient_age: patient.patient_age ? parseInt(patient.patient_age) : null,
        patient_gender: patient.patient_gender || null,
        ...form,
        detected_themes: ai.detected_themes ?? [],
        ai_analysis: ai,
        remedy_cluster: ai.remedy_cluster ?? [],
        suggested_remedy: ai.suggested_remedy ?? null,
        differential_remedies: ai.differential_remedies ?? [],
        key_reasons: ai.key_reasons ?? null,
      };
      const { data: row, error } = await supabase
        .from("homeo_mind_cases").insert(insertPayload).select("id").single();
      if (error) throw error;
      toast.success("Case analyzed and saved");
      navigate(`/homeo/mind/cases/${row.id}`);
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className={t.label}>Mind Case · Narrative Intake</p>
        <h1 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">New perception-based case</h1>
        <p className={`${t.mutedText} text-sm mt-1`}>
          Capture the patient in their own words. The AI engine maps emotional themes to remedies — your final decision matters most.
        </p>
      </div>

      <div className={`${t.card} p-5 space-y-3`}>
        <p className={t.label}>Patient</p>
        <div className="grid gap-3 md:grid-cols-3">
          <input className={t.input} placeholder="Full name" value={patient.patient_name}
            onChange={(e) => setPatient((p) => ({ ...p, patient_name: e.target.value }))} />
          <input className={t.input} placeholder="Age" type="number" value={patient.patient_age}
            onChange={(e) => setPatient((p) => ({ ...p, patient_age: e.target.value }))} />
          <select className={t.input} value={patient.patient_gender}
            onChange={(e) => setPatient((p) => ({ ...p, patient_gender: e.target.value }))}>
            <option value="">Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={`${t.card} p-4 ${f.area ? "md:col-span-2" : ""}`}>
            <label className={t.label}>{f.label}</label>
            {f.area ? (
              <textarea className={`${t.input} mt-1 min-h-[90px]`} placeholder={f.placeholder}
                value={form[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} />
            ) : (
              <input className={`${t.input} mt-1`} placeholder={f.placeholder}
                value={form[f.key] ?? ""} onChange={(e) => update(f.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={analyze} disabled={analyzing} className={t.primaryBtn}>
          {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing themes…</> : <><Sparkles className="h-4 w-4" /> Analyze & save case</>}
        </button>
        <button onClick={() => navigate("/homeo/mind")} className={t.ghostBtn}>Cancel</button>
      </div>

      <p className={`text-xs ${t.mutedText}`}>
        Educational clinical support only. Final prescription must be made by a qualified physician.
      </p>
    </div>
  );
};

export default MindNewCase;
