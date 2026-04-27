import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Brain, HeartPulse, Activity, Scroll, Sparkles, ChevronLeft, ChevronRight, Save, Loader2, Wand2, Telescope, Quote, Star } from "lucide-react";

type Mode = "case" | "patient";

const TABS = [
  { id: "complaint", label: "Chief Complaint", icon: HeartPulse },
  { id: "mental", label: "Mental Symptoms", icon: Brain },
  { id: "sehgal", label: "Sehgal AI", icon: Telescope },
  { id: "physical", label: "Physical Generals", icon: Activity },
  { id: "history", label: "History", icon: Scroll },
  { id: "review", label: "Review", icon: Sparkles },
] as const;

type SehgalTheme = {
  theme: string; slug: string; short_description: string; confidence: number;
  evidence: string[]; reasoning: string;
  ranked_remedies: { remedy: string; score: number }[];
  differentials: string[]; followup_questions: string[];
};
type SehgalResult = {
  case_summary: string;
  detected_themes: SehgalTheme[];
  ranked_remedies: { remedy: string; score: number; themes_supporting: string[]; max_theme_confidence: number }[];
  suggested_similimum: { remedy: string; score: number; rationale: string } | null;
  followup_questions: string[];
};

const FEAR_CHIPS = ["Death","Dark","Heights","Crowds","Animals","Disease","Poverty","Failure","Being alone","Robbers","Thunderstorms","Future","Closed spaces","Open spaces","Snakes","Insanity"];
const AVERSION_MIND = ["Consolation","Company","Sympathy","Contradiction","Noise","Music","Touch","Being observed","Responsibility"];
const DESIRES = ["Company","Open air","Sympathy","Solitude","Approval","Order","Movement","Stillness"];
const FOOD_CRAVINGS = ["Salt","Sweets","Sour","Spicy","Fatty","Cold drinks","Warm drinks","Bread","Eggs","Meat","Chocolate","Coffee","Milk","Lemons","Pickles","Ice cream"];
const FOOD_AVERSIONS = ["Meat","Fat","Milk","Eggs","Sweets","Onions","Coffee","Vegetables","Fish","Bread"];
const MOD_BETTER = ["Warmth","Cold","Open air","Closed room","Pressure","Motion","Rest","Lying down","Sitting","Standing","Eating","Drinking","Sleep","Bathing","Discharge","Bending forward","Bending backward","Hard pressure"];
const MOD_WORSE = ["Cold","Heat","Damp","Drafts","Touch","Noise","Light","Motion","Rest","Eating","Empty stomach","Morning","Evening","Night","Before menses","During menses","Mental exertion","Consolation"];
const EMOTIONAL_THEMES = ["Grief","Anger (suppressed)","Anger (explosive)","Humiliation","Rejection","Fear","Anxiety","Anticipation","Guilt","Shame","Jealousy","Loneliness","Disappointment","Loss of control","Performance anxiety"];

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
      active
        ? "border-[hsl(45_85%_55%)] bg-[hsl(45_85%_55%/0.18)] text-[hsl(45_85%_82%)]"
        : "border-[hsl(45_40%_55%/0.2)] text-[hsl(45_15%_75%)] hover:border-[hsl(45_85%_55%/0.5)] hover:bg-[hsl(45_85%_55%/0.06)]"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className={t.label}>{label}</label>
    {children}
  </div>
);

const ChipGroup = ({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) => {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Chip key={o} active={value.includes(o)} onClick={() => toggle(o)}>{o}</Chip>
        ))}
      </div>
    </Field>
  );
};

const initialForm = {
  patient_name: "", patient_age: "" as string | number, patient_gender: "", patient_phone: "", patient_occupation: "",
  chief_complaint: "", complaint_onset: "", complaint_duration: "", history_present_illness: "",
  mental_state: "", intellectual_state: "", life_situation: "", significant_events: "",
  emotional_themes: [] as string[], fears: [] as string[], aversions_mind: [] as string[], desires: [] as string[],
  thermal_state: "", thirst: "", appetite: "", perspiration: "",
  food_cravings: [] as string[], food_aversions: [] as string[],
  sleep: "", sleep_position: "", dreams: "", menses: "", sexual_history: "",
  modalities_better: [] as string[], modalities_worse: [] as string[],
  past_medical_history: "", family_history: "",
  miasm_assessment: "", miasm_evidence: "",
  doctor_notes: "", constitutional_summary: "",
};

const CaseTakingForm = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const caseId = params.get("case");
  const patientId = params.get("patient");
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("complaint");
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (caseId) {
        const { data } = await supabase.from("homeopathy_cases").select("*").eq("id", caseId).maybeSingle();
        if (data) {
          setForm({
            ...initialForm,
            ...Object.fromEntries(Object.entries(data).filter(([k]) => k in initialForm)),
            patient_age: data.patient_age ?? "",
          } as any);
        }
      } else if (patientId) {
        const { data } = await supabase.from("homeo_patients").select("*").eq("id", patientId).maybeSingle();
        if (data) setForm((p) => ({ ...p, patient_name: data.full_name ?? "", patient_age: data.age ?? "", patient_gender: data.gender ?? "" }));
      }
    };
    load();
  }, [caseId, patientId]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));
  const tabIndex = TABS.findIndex((x) => x.id === tab);

  const buildPayload = () => {
    const p: any = { ...form };
    p.patient_age = form.patient_age === "" ? null : Number(form.patient_age);
    return p;
  };

  const save = async (silent = false) => {
    if (!form.patient_name) { toast.error("Patient name is required"); return null; }
    if (!form.chief_complaint) { toast.error("Chief complaint is required"); setTab("complaint"); return null; }
    setSaving(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) { setSaving(false); toast.error("Please sign in"); return null; }
    const payload = { ...buildPayload(), doctor_user_id: uid };
    const res = caseId
      ? await supabase.from("homeopathy_cases").update(payload).eq("id", caseId).select("id").single()
      : await supabase.from("homeopathy_cases").insert(payload).select("id").single();
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return null; }
    if (!silent) toast.success("Case saved");
    if (!caseId && res.data?.id) navigate(`/homeo/case-form?case=${res.data.id}`, { replace: true });
    return res.data?.id ?? caseId;
  };

  const generateSummary = async () => {
    setGenLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("homeo-constitutional-summary", {
        body: { caseData: buildPayload() },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const summary = (data as any)?.summary || "";
      set("constitutional_summary", summary);
      toast.success("Constitutional summary generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate summary");
    } finally {
      setGenLoading(false);
    }
  };

  const completion = useMemo(() => {
    const filled = [
      form.patient_name, form.chief_complaint, form.mental_state,
      form.thermal_state, form.thirst, form.past_medical_history,
    ].filter(Boolean).length;
    return Math.round((filled / 6) * 100);
  }, [form]);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={t.label}>Classical Homeopathy</p>
          <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Digital Case Taking</h2>
          <p className={`${t.mutedText} mt-1 text-sm`}>5-step protocol · Hahnemannian totality · AI constitutional synthesis</p>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-xs text-[hsl(45_15%_60%)]">Completion</p>
          <p className="font-display text-2xl text-[hsl(45_85%_72%)]">{completion}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[hsl(45_40%_55%/0.15)] pb-1">
        {TABS.map((x, i) => {
          const Icon = x.icon;
          const active = tab === x.id;
          return (
            <button
              key={x.id}
              onClick={() => setTab(x.id)}
              className={`flex items-center gap-2 rounded-t-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[hsl(45_85%_55%/0.12)] text-[hsl(45_85%_78%)] border-b-2 border-[hsl(45_85%_55%)]"
                  : "text-[hsl(45_15%_70%)] hover:text-[hsl(45_85%_72%)]"
              }`}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-[hsl(45_40%_55%/0.3)] text-[10px]">{i + 1}</span>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{x.label}</span>
            </button>
          );
        })}
      </div>

      <div className={`${t.card} p-5 md:p-6`}>
        {tab === "complaint" && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Patient name *">
                <input className={t.input} value={form.patient_name} onChange={(e) => set("patient_name", e.target.value)} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Age">
                  <input className={t.input} type="number" value={form.patient_age as any} onChange={(e) => set("patient_age", e.target.value)} />
                </Field>
                <Field label="Gender">
                  <select className={t.input} value={form.patient_gender} onChange={(e) => set("patient_gender", e.target.value)}>
                    <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </Field>
                <Field label="Phone">
                  <input className={t.input} value={form.patient_phone} onChange={(e) => set("patient_phone", e.target.value)} />
                </Field>
              </div>
              <Field label="Occupation">
                <input className={t.input} value={form.patient_occupation} onChange={(e) => set("patient_occupation", e.target.value)} />
              </Field>
            </div>

            <Field label="Chief complaint *">
              <textarea className={`${t.input} min-h-[90px]`} value={form.chief_complaint}
                placeholder="Patient's main suffering, in their own words…"
                onChange={(e) => set("chief_complaint", e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Onset">
                <input className={t.input} placeholder="When did it start? Sudden / gradual?" value={form.complaint_onset} onChange={(e) => set("complaint_onset", e.target.value)} />
              </Field>
              <Field label="Duration">
                <input className={t.input} placeholder="How long? Frequency?" value={form.complaint_duration} onChange={(e) => set("complaint_duration", e.target.value)} />
              </Field>
            </div>
            <Field label="History of present illness">
              <textarea className={`${t.input} min-h-[100px]`} placeholder="Evolution, treatments tried, what makes it better/worse…" value={form.history_present_illness} onChange={(e) => set("history_present_illness", e.target.value)} />
            </Field>
          </div>
        )}

        {tab === "mental" && (
          <div className="space-y-5">
            <Field label="Mental state — emotional core">
              <textarea className={`${t.input} min-h-[100px]`} placeholder="Mood, irritability, weeping, anger patterns, sensitivity…" value={form.mental_state} onChange={(e) => set("mental_state", e.target.value)} />
            </Field>
            <Field label="Intellectual state">
              <textarea className={`${t.input} min-h-[80px]`} placeholder="Memory, concentration, confusion, decision-making…" value={form.intellectual_state} onChange={(e) => set("intellectual_state", e.target.value)} />
            </Field>
            <ChipGroup label="Dominant emotional themes" options={EMOTIONAL_THEMES} value={form.emotional_themes} onChange={(v) => set("emotional_themes", v)} />
            <ChipGroup label="Fears" options={FEAR_CHIPS} value={form.fears} onChange={(v) => set("fears", v)} />
            <ChipGroup label="Aversions (mind)" options={AVERSION_MIND} value={form.aversions_mind} onChange={(v) => set("aversions_mind", v)} />
            <ChipGroup label="Desires (mind)" options={DESIRES} value={form.desires} onChange={(v) => set("desires", v)} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Life situation">
                <textarea className={`${t.input} min-h-[80px]`} placeholder="Family, work, relationships context…" value={form.life_situation} onChange={(e) => set("life_situation", e.target.value)} />
              </Field>
              <Field label="Significant events / ailments from">
                <textarea className={`${t.input} min-h-[80px]`} placeholder="Grief, shock, suppressed emotions, traumas…" value={form.significant_events} onChange={(e) => set("significant_events", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {tab === "physical" && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Thermal state">
                <select className={t.input} value={form.thermal_state} onChange={(e) => set("thermal_state", e.target.value)}>
                  <option value="">—</option><option>Hot patient</option><option>Chilly patient</option><option>Mixed / ambithermal</option>
                </select>
              </Field>
              <Field label="Thirst">
                <input className={t.input} placeholder="Increased / decreased / for cold / sips" value={form.thirst} onChange={(e) => set("thirst", e.target.value)} />
              </Field>
              <Field label="Appetite">
                <input className={t.input} placeholder="Increased / decreased / canine / quickly satiated" value={form.appetite} onChange={(e) => set("appetite", e.target.value)} />
              </Field>
              <Field label="Perspiration">
                <input className={t.input} placeholder="Location, odor, staining, time of day" value={form.perspiration} onChange={(e) => set("perspiration", e.target.value)} />
              </Field>
            </div>
            <ChipGroup label="Food cravings (desires)" options={FOOD_CRAVINGS} value={form.food_cravings} onChange={(v) => set("food_cravings", v)} />
            <ChipGroup label="Food aversions" options={FOOD_AVERSIONS} value={form.food_aversions} onChange={(v) => set("food_aversions", v)} />
            <ChipGroup label="Aggravations (worse from)" options={MOD_WORSE} value={form.modalities_worse} onChange={(v) => set("modalities_worse", v)} />
            <ChipGroup label="Ameliorations (better from)" options={MOD_BETTER} value={form.modalities_better} onChange={(v) => set("modalities_better", v)} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Sleep">
                <input className={t.input} placeholder="Time, quality, refreshing or not" value={form.sleep} onChange={(e) => set("sleep", e.target.value)} />
              </Field>
              <Field label="Sleep position">
                <input className={t.input} placeholder="Back / side / abdomen / knee-chest" value={form.sleep_position} onChange={(e) => set("sleep_position", e.target.value)} />
              </Field>
              <Field label="Dreams">
                <textarea className={`${t.input} min-h-[70px]`} placeholder="Recurring, vivid, prophetic, anxious…" value={form.dreams} onChange={(e) => set("dreams", e.target.value)} />
              </Field>
              <Field label="Menses (if applicable)">
                <textarea className={`${t.input} min-h-[70px]`} placeholder="Cycle, flow, color, clots, modalities" value={form.menses} onChange={(e) => set("menses", e.target.value)} />
              </Field>
            </div>
            <Field label="Sexual history">
              <textarea className={`${t.input} min-h-[70px]`} placeholder="Desire, function, relevant history" value={form.sexual_history} onChange={(e) => set("sexual_history", e.target.value)} />
            </Field>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-5">
            <Field label="Past medical history">
              <textarea className={`${t.input} min-h-[100px]`} placeholder="Past illnesses, surgeries, vaccinations, suppressions…" value={form.past_medical_history} onChange={(e) => set("past_medical_history", e.target.value)} />
            </Field>
            <Field label="Family history">
              <textarea className={`${t.input} min-h-[100px]`} placeholder="TB, DM, cancer, mental illness, allergies in family" value={form.family_history} onChange={(e) => set("family_history", e.target.value)} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Miasm assessment">
                <select className={t.input} value={form.miasm_assessment} onChange={(e) => set("miasm_assessment", e.target.value)}>
                  <option value="">—</option>
                  <option>Psoric</option><option>Sycotic</option><option>Syphilitic</option><option>Tubercular</option><option>Mixed</option>
                </select>
              </Field>
              <Field label="Miasm evidence">
                <input className={t.input} placeholder="Key indicators supporting the assessment" value={form.miasm_evidence} onChange={(e) => set("miasm_evidence", e.target.value)} />
              </Field>
            </div>
            <Field label="Doctor's clinical notes">
              <textarea className={`${t.input} min-h-[100px]`} placeholder="Observations, working hypothesis, diagnostic considerations" value={form.doctor_notes} onChange={(e) => set("doctor_notes", e.target.value)} />
            </Field>
          </div>
        )}

        {tab === "review" && (
          <div className="space-y-5">
            <div className="rounded-lg border border-[hsl(45_85%_55%/0.25)] bg-[hsl(45_85%_55%/0.06)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[hsl(45_85%_78%)]">AI Constitutional Summary</p>
                  <p className={`${t.mutedText} text-xs`}>One-paragraph synthesis of the totality. Editable. Final remedy decision is yours.</p>
                </div>
                <button onClick={generateSummary} disabled={genLoading} className={t.primaryBtn}>
                  {genLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {genLoading ? "Generating…" : form.constitutional_summary ? "Regenerate" : "Generate Summary"}
                </button>
              </div>
              <textarea
                className={`${t.input} mt-3 min-h-[180px] leading-relaxed`}
                placeholder="Click 'Generate Summary' to synthesize the case totality into a constitutional portrait…"
                value={form.constitutional_summary}
                onChange={(e) => set("constitutional_summary", e.target.value)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ReviewCard title="Patient" lines={[`${form.patient_name || "—"} · ${form.patient_age || "?"}y · ${form.patient_gender || "—"}`, form.patient_occupation || ""]} />
              <ReviewCard title="Chief complaint" lines={[form.chief_complaint || "—", `${form.complaint_onset || ""} ${form.complaint_duration ? "· " + form.complaint_duration : ""}`]} />
              <ReviewCard title="Mental themes" lines={[form.emotional_themes.join(", ") || "—", `Fears: ${form.fears.join(", ") || "—"}`]} />
              <ReviewCard title="Physical generals" lines={[`Thermal: ${form.thermal_state || "—"} · Thirst: ${form.thirst || "—"}`, `Cravings: ${form.food_cravings.join(", ") || "—"}`]} />
              <ReviewCard title="Modalities" lines={[`< ${form.modalities_worse.join(", ") || "—"}`, `> ${form.modalities_better.join(", ") || "—"}`]} />
              <ReviewCard title="Miasm" lines={[form.miasm_assessment || "—", form.miasm_evidence || ""]} />
            </div>

            <p className="rounded-md border border-[hsl(45_40%_55%/0.2)] bg-[hsl(160_30%_8%)] p-3 text-xs text-[hsl(45_15%_70%)]">
              <strong className="text-[hsl(45_85%_72%)]">Disclaimer:</strong> This software provides clinical decision support based on classical homeopathy principles. Final remedy selection, potency, and prescription are the prescribing physician's responsibility.
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setTab(TABS[Math.max(0, tabIndex - 1)].id)}
          disabled={tabIndex === 0}
          className={t.ghostBtn + " disabled:opacity-40"}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <div className="flex gap-2">
          <button onClick={() => save(false)} disabled={saving} className={t.ghostBtn}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
          </button>
          {tab === "review" ? (
            <button
              onClick={async () => { const id = await save(true); if (id) { toast.success("Case saved"); navigate(`/homeo/repertory?case=${id}`); } }}
              disabled={saving}
              className={t.primaryBtn}
            >
              Save & open repertory <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => setTab(TABS[tabIndex + 1].id)} className={t.primaryBtn}>
              Next <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({ title, lines }: { title: string; lines: string[] }) => (
  <div className="rounded-lg border border-[hsl(45_40%_55%/0.18)] bg-[hsl(160_30%_6%)] p-3">
    <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(45_85%_60%/0.85)]">{title}</p>
    {lines.filter(Boolean).map((l, i) => (
      <p key={i} className={i === 0 ? "mt-1 text-sm text-[hsl(45_30%_94%)]" : "text-xs text-[hsl(45_15%_70%)]"}>{l}</p>
    ))}
  </div>
);

export default CaseTakingForm;
