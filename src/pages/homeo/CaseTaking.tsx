import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { AiPrescriptionDraftDialog } from "@/components/ai/AiPrescriptionDraftDialog";

const sections: { key: string; label: string; placeholder: string }[] = [
  { key: "mind", label: "Mind symptoms", placeholder: "Anxiety, anger, fears, grief, ailments from…" },
  { key: "thermal_state", label: "Thermal state", placeholder: "Hot / chilly patient, intolerance to heat or cold" },
  { key: "thirst", label: "Thirst", placeholder: "Increased / decreased / for cold / sips" },
  { key: "cravings", label: "Cravings", placeholder: "Salt, sweets, sour, spicy…" },
  { key: "aversions", label: "Aversions", placeholder: "Milk, fat, meat…" },
  { key: "sleep", label: "Sleep", placeholder: "Position, time of waking, refreshing or not" },
  { key: "dreams", label: "Dreams", placeholder: "Recurring, vivid, snakes, falling, dead…" },
  { key: "perspiration", label: "Perspiration", placeholder: "Location, odor, staining, with/without thirst" },
  { key: "stool", label: "Stool", placeholder: "Frequency, form, color, odor, urging" },
  { key: "urine", label: "Urine", placeholder: "Frequency, color, odor, sediment, burning" },
  { key: "female_complaints", label: "Female complaints", placeholder: "Menses, leucorrhoea, OB history…" },
  { key: "modalities_better", label: "Modalities — better from", placeholder: "Heat, motion, pressure, open air…" },
  { key: "modalities_worse", label: "Modalities — worse from", placeholder: "Cold, rest, after eating, evening…" },
  { key: "past_history", label: "Past history", placeholder: "Past illnesses, surgeries, suppressions" },
  { key: "family_history", label: "Family history", placeholder: "TB, DM, cancer, mental illness in family" },
];

const CaseTaking = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const patientId = params.get("patient");
  const caseId = params.get("case");
  const [patient, setPatient] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (caseId) {
        const { data } = await supabase.from("homeo_cases").select("*, patient:homeo_patients(*)").eq("id", caseId).maybeSingle();
        if (data) {
          setPatient(data.patient);
          const f: Record<string, string> = {};
          sections.forEach((s) => (f[s.key] = (data as any)[s.key] ?? ""));
          setForm(f);
        }
      } else if (patientId) {
        const { data } = await supabase.from("homeo_patients").select("*").eq("id", patientId).maybeSingle();
        setPatient(data);
      }
    };
    load();
  }, [patientId, caseId]);

  const save = async () => {
    if (!patient) return toast.error("No patient selected. Add one first.");
    setSaving(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) { setSaving(false); return; }
    const payload: any = { ...form, patient_id: patient.id, doctor_user_id: uid };
    let res;
    if (caseId) res = await supabase.from("homeo_cases").update(payload).eq("id", caseId).select("id").single();
    else res = await supabase.from("homeo_cases").insert(payload).select("id").single();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Case saved");
    navigate(`/homeo/repertory?case=${res.data.id}`);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className={t.label}>Full Hahnemannian Case Taking</p>
        <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">
          {patient ? `${patient.full_name} · ${patient.age ?? "?"} y · ${patient.gender ?? "—"}` : "Select a patient"}
        </h2>
      </div>
      {!patient && (
        <div className={`${t.card} p-6`}>
          <p className={t.mutedText}>No patient. <a href="/homeo/patients/new" className="text-[hsl(45_85%_60%)] underline">Create one</a>.</p>
        </div>
      )}
      {patient && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((s) => (
              <div key={s.key} className={`${t.card} p-4`}>
                <label className={t.label}>{s.label}</label>
                <textarea
                  className={`${t.input} mt-1 min-h-[100px]`}
                  placeholder={s.placeholder}
                  value={form[s.key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [s.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={save} disabled={saving} className={t.primaryBtn}>
              {saving ? "Saving…" : "Save & open repertory →"}
            </button>
            <button onClick={() => navigate("/homeo")} className={t.ghostBtn}>Back</button>
            {caseId && (
              <AiPrescriptionDraftDialog
                ayushSystem="homeopathy"
                patientRecordTable="homeo_cases"
                patientRecordId={caseId}
                patientDisplayName={patient?.full_name}
                initialDiagnosis={form.mind || ""}
                initialHistorySummary={[form.past_history, form.family_history].filter(Boolean).join("\n")}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CaseTaking;
