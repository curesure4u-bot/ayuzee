import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "../lib/ui";
import { Loader2, Save, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AiPrescriptionDraftDialog } from "@/components/ai/AiPrescriptionDraftDialog";

const MindCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState({ doctor_final_remedy: "", doctor_decision_notes: "", potency: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("homeo_mind_cases").select("*").eq("id", id).maybeSingle();
      if (data) {
        setC(data);
        setDecision({
          doctor_final_remedy: data.doctor_final_remedy ?? data.suggested_remedy ?? "",
          doctor_decision_notes: data.doctor_decision_notes ?? "",
          potency: data.potency ?? "",
        });
      }
      setLoading(false);
    })();
  }, [id]);

  const saveDecision = async () => {
    setSaving(true);
    const { error } = await supabase.from("homeo_mind_cases").update(decision).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Decision saved");
  };

  const closeCase = async () => {
    await supabase.from("homeo_mind_cases").update({ status: "closed" }).eq("id", id);
    toast.success("Case closed");
    navigate("/homeo/mind/cases");
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-[hsl(45_85%_60%)]" />;
  if (!c) return <p className={t.mutedText}>Case not found.</p>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className={t.label}>Mind Case · Output</p>
          <h1 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">
            {c.patient_name || "Unnamed"}{c.patient_age ? ` · ${c.patient_age}y` : ""}{c.patient_gender ? ` · ${c.patient_gender}` : ""}
          </h1>
          <p className={`${t.mutedText} text-sm mt-1`}>{c.chief_complaint}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/homeo/mind/cases/${id}/followup`} className={t.ghostBtn}>+ Follow-up</Link>
          {c.status === "active" && <button onClick={closeCase} className={t.ghostBtn}><CheckCircle2 className="h-4 w-4" /> Close case</button>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={`${t.card} p-5`}>
          <p className={t.label}>Dominant mental themes</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {(c.detected_themes ?? []).length === 0 ? <span className={t.mutedText}>—</span> : c.detected_themes.map((th: string) => (
              <span key={th} className="text-xs uppercase tracking-wider bg-[hsl(142_55%_30%/0.3)] text-[hsl(142_60%_75%)] px-3 py-1 rounded-full">
                {th}
              </span>
            ))}
          </div>
          {c.ai_analysis?.essence && (
            <>
              <p className={`${t.label} mt-4`}>Case essence</p>
              <p className="text-[hsl(45_30%_92%)] mt-1 italic">"{c.ai_analysis.essence}"</p>
            </>
          )}
          {c.ai_analysis?.central_theme && (
            <>
              <p className={`${t.label} mt-4`}>Central theme</p>
              <p className="text-[hsl(45_85%_75%)] font-semibold mt-1 capitalize">{c.ai_analysis.central_theme}</p>
            </>
          )}
        </div>

        <div className={`${t.card} p-5`}>
          <p className={t.label}>Suggested similimum</p>
          <p className="font-display text-2xl text-[hsl(45_85%_78%)] mt-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> {c.suggested_remedy || "—"}
          </p>
          <p className={`${t.label} mt-4`}>Likely remedy cluster</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {(c.remedy_cluster ?? []).map((r: string) => (
              <span key={r} className={t.pill}>{r}</span>
            ))}
          </div>
          <p className={`${t.label} mt-4`}>Differential remedies</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {(c.differential_remedies ?? []).map((r: string) => (
              <span key={r} className="px-3 py-1 rounded-full text-xs border border-[hsl(45_40%_55%/0.3)] text-[hsl(45_30%_92%)]">{r}</span>
            ))}
          </div>
        </div>
      </div>

      {c.key_reasons && (
        <div className={`${t.card} p-5`}>
          <p className={t.label}>Key reasons</p>
          <p className="text-[hsl(45_30%_92%)] mt-2 whitespace-pre-wrap text-sm leading-relaxed">{c.key_reasons}</p>
        </div>
      )}

      <div className={`${t.card} p-5 border-[hsl(45_85%_55%/0.35)]`}>
        <p className={t.label}>Doctor's final decision</p>
        <div className="grid gap-3 md:grid-cols-3 mt-3">
          <input className={`${t.input} md:col-span-2`} placeholder="Final remedy" value={decision.doctor_final_remedy}
            onChange={(e) => setDecision((p) => ({ ...p, doctor_final_remedy: e.target.value }))} />
          <input className={t.input} placeholder="Potency (e.g. 200C)" value={decision.potency}
            onChange={(e) => setDecision((p) => ({ ...p, potency: e.target.value }))} />
        </div>
        <textarea className={`${t.input} mt-3 min-h-[100px]`} placeholder="Clinical reasoning, dosage plan, instructions…"
          value={decision.doctor_decision_notes}
          onChange={(e) => setDecision((p) => ({ ...p, doctor_decision_notes: e.target.value }))} />
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={saveDecision} disabled={saving} className={t.primaryBtn}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save decision</>}
          </button>
          <AiPrescriptionDraftDialog
            ayushSystem="homeopathy"
            patientRecordTable="homeo_mind_cases"
            patientRecordId={String(id)}
            patientDisplayName={c.patient_name || undefined}
            initialDiagnosis={[c.suggested_remedy && `Suggested similimum: ${c.suggested_remedy}`, c.chief_complaint].filter(Boolean).join("\n")}
            initialHistorySummary={[
              c.ai_analysis?.essence && `Essence: ${c.ai_analysis.essence}`,
              c.ai_analysis?.central_theme && `Central theme: ${c.ai_analysis.central_theme}`,
              c.key_reasons,
            ].filter(Boolean).join("\n")}
            triggerVariant="default"
          />
        </div>
      </div>

      <details className={`${t.card} p-5`}>
        <summary className="cursor-pointer text-[hsl(45_85%_70%)] font-medium">View full narrative intake</summary>
        <div className="grid gap-3 mt-4 md:grid-cols-2 text-sm">
          {[
            ["Trigger event", c.trigger_event], ["What bothers most", c.bothers_most],
            ["Reaction", c.reaction], ["Repeating emotion", c.repeating_emotion],
            ["Deepest fear", c.deepest_fear], ["What hurts deeply", c.what_hurts],
            ["Suppressed", c.what_suppressed], ["Relationship pattern", c.relationship_pattern],
            ["Work pattern", c.work_pattern],
          ].map(([label, val]) => val ? (
            <div key={label as string}>
              <p className={t.label}>{label}</p>
              <p className="text-[hsl(45_30%_92%)] mt-1 whitespace-pre-wrap">{val as string}</p>
            </div>
          ) : null)}
        </div>
      </details>

      <p className={`text-xs ${t.mutedText}`}>Educational clinical support only. Final prescription is the responsibility of the qualified physician.</p>
    </div>
  );
};

export default MindCaseDetail;
