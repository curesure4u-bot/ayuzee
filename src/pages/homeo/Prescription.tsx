import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Pill, Save, Info, BookOpen, GitCompareArrows, Sparkles, Loader2, X, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const POTENCIES: { value: string; tip: string }[] = [
  { value: "6C", tip: "Low potency · gentle, frequent repetition · acute physical symptoms, beginners, sensitive patients" },
  { value: "30C", tip: "Most common starting potency · acute & sub-acute conditions · safe for general practice" },
  { value: "200C", tip: "Medium-high · constitutional cases, well-selected similimum · 1–3 doses, observe long" },
  { value: "1M", tip: "High potency · deep constitutional / chronic cases · single dose, wait weeks" },
  { value: "10M", tip: "Very high · chronic miasmatic cases · only with clear similimum, infrequent" },
  { value: "50M", tip: "Very high · advanced classical practice · use sparingly with deep totality" },
  { value: "CM", tip: "Highest centesimal · single dose, long observation · expert classical use only" },
  { value: "3X", tip: "Decimal low · physiological/organopathic action · frequent doses (TDS)" },
  { value: "6X", tip: "Decimal low · tissue remedies, biochemic salts · 3–4 times daily" },
  { value: "12X", tip: "Decimal · tonic/supportive use · 2–3 times daily" },
  { value: "30X", tip: "Decimal mid · gentle action, frequent dosing safe" },
  { value: "Q (Mother)", tip: "Mother tincture · drops in water · organopathic / palliative · NOT classical similimum" },
];
const DOSAGES = ["Single dose", "BD x 3 days", "TDS x 5 days", "OD x 7 days", "Weekly x 4", "Monthly x 3", "SOS"];

const ANTIDOTES: { label: string; note: string }[] = [
  { label: "Avoid coffee", note: "Caffeine antidotes most remedies" },
  { label: "Avoid mint / toothpaste mint", note: "Use non-mint paste during treatment" },
  { label: "Avoid camphor", note: "Strong antidote — balms, vapour rubs, mothballs" },
  { label: "Avoid eucalyptus / strong aromatics", note: "Inhalers, perfumes can interfere" },
  { label: "Avoid raw onion / garlic in excess", note: "May antidote sensitive constitutions" },
  { label: "No alcohol", note: "Especially within 30 min of dose" },
  { label: "Take on empty stomach", note: "30 min before / after food" },
  { label: "No food/drink 15 min around dose", note: "Let pellets dissolve under tongue" },
  { label: "Store away from sunlight & EMF", note: "Keep vial away from phones/microwaves" },
  { label: "Stop if aggravation > 48 h", note: "Report back to prescriber" },
];

type Row = { remedy_id: string; remedy_name: string; potency: string; dosage: string; instructions: string };
type FoodPick = { recipe_id: string; name: string; dose: string; when_to_take: string; duration: string };

const Prescription = () => {
  const [params] = useSearchParams();
  const caseId = params.get("case");
  const [caseData, setCaseData] = useState<any>(null);
  const [remedies, setRemedies] = useState<any[]>([]);
  const [list, setList] = useState<Row[]>([{ remedy_id: "", remedy_name: "", potency: "30C", dosage: "Single dose", instructions: "" }]);
  const [advice, setAdvice] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>(["Avoid coffee", "Avoid mint / toothpaste mint", "Avoid camphor", "Take on empty stomach"]);
  const [followupDate, setFollowupDate] = useState("");
  const [durationDays, setDurationDays] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Food as Medicine
  const [foodRecipes, setFoodRecipes] = useState<{ id: string; name: string; category: string; indications: string[] }[]>([]);
  const [foodPicks, setFoodPicks] = useState<FoodPick[]>([]);
  const [foodSearch, setFoodSearch] = useState("");

  // Reference panel
  const [refRemedy, setRefRemedy] = useState<any>(null);
  const [refLoading, setRefLoading] = useState(false);

  // AI differentiation
  const [diffLoading, setDiffLoading] = useState(false);
  const [diff, setDiff] = useState<any>(null);

  const loadHistory = async () => {
    if (!caseId) return;
    const { data: rx } = await supabase.from("homeo_prescriptions").select("*").eq("case_id", caseId).order("prescribed_at", { ascending: false });
    setHistory(rx ?? []);
  };

  useEffect(() => {
    const load = async () => {
      const { data: rem } = await supabase.from("homeo_remedies").select("id, name, abbreviation").order("name").limit(500);
      setRemedies(rem ?? []);
      const { data: foods } = await supabase
        .from("food_recipes" as any)
        .select("id, name, category, indications")
        .eq("is_published", true)
        .order("name");
      setFoodRecipes((foods ?? []) as any);
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

  const removeRow = (i: number) => setList((prev) => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i));

  const toggleRestriction = (label: string) =>
    setRestrictions((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));

  const openReference = async (id: string) => {
    if (!id) return;
    setRefLoading(true);
    setRefRemedy({ id, loading: true });
    const { data } = await supabase
      .from("homeo_remedies")
      .select("id, name, common_name, abbreviation, latin_name, short_description, keynotes, keynote_symptoms, mental_emotional_picture, general_symptoms, thermal, thirst, food_desires, food_aversions, modalities_better, modalities_worse, miasm")
      .eq("id", id)
      .single();
    setRefRemedy(data);
    setRefLoading(false);
  };

  const selectedRemedyIds = useMemo(() => list.map((r) => r.remedy_id).filter(Boolean), [list]);

  const runDifferentiate = async () => {
    if (selectedRemedyIds.length < 2) return toast.error("Select at least 2 remedies in the prescription rows");
    setDiffLoading(true);
    setDiff(null);
    const { data: full } = await supabase
      .from("homeo_remedies")
      .select("name, abbreviation, short_description, keynotes, keynote_symptoms")
      .in("id", selectedRemedyIds);
    const summary = caseData
      ? `Patient ${caseData.patient?.full_name ?? ""}, ${caseData.patient?.age ?? "?"} y. Chief: ${caseData.patient?.chief_complaint ?? caseData.chief_complaint ?? "n/a"}.`
      : "";
    const { data, error } = await supabase.functions.invoke("homeo-remedy-differentiate", {
      body: { remedies: full ?? [], case_summary: summary },
    });
    setDiffLoading(false);
    if (error) return toast.error(error.message);
    if ((data as any)?.error) return toast.error((data as any).error);
    setDiff(data);
  };

  const save = async () => {
    if (!caseId || !caseData) return toast.error("Open from a case to save prescription");
    const valid = list.filter((r) => r.remedy_id);
    if (!valid.length) return toast.error("Select at least one remedy");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const fullAdvice = [advice, restrictions.length ? `Restrictions: ${restrictions.join(", ")}` : ""].filter(Boolean).join(" | ");
    const rows = valid.map((r) => ({
      case_id: caseId,
      patient_id: caseData.patient_id,
      doctor_user_id: u.user!.id,
      remedy_id: r.remedy_id,
      remedy_name: r.remedy_name,
      potency: r.potency,
      dosage: r.dosage,
      instructions: [r.instructions, fullAdvice].filter(Boolean).join(" — "),
      duration_days: durationDays ? parseInt(durationDays, 10) : null,
      follow_up_date: followupDate || null,
    }));
    const { data: rxInserted, error } = await supabase.from("homeo_prescriptions").insert(rows).select("id");
    if (error) { setSaving(false); return toast.error(error.message); }

    // Attach food recipes to first prescription row (acts as the "diet plan" for this Rx)
    if (foodPicks.length && rxInserted?.[0]?.id) {
      const rxId = rxInserted[0].id;
      const foodRows = foodPicks.map((f) => ({
        prescription_id: rxId,
        recipe_id: f.recipe_id,
        dose: f.dose || null,
        when_to_take: f.when_to_take || null,
        duration: f.duration || null,
      }));
      await supabase.from("prescription_food_recipes" as any).insert(foodRows);
    }

    setSaving(false);
    toast.success("Prescription saved");
    setList([{ remedy_id: "", remedy_name: "", potency: "30C", dosage: "Single dose", instructions: "" }]);
    setFoodPicks([]);
    await loadHistory();
  };

  const addFoodPick = (recipe: { id: string; name: string }) => {
    if (foodPicks.find((f) => f.recipe_id === recipe.id)) return;
    setFoodPicks([...foodPicks, { recipe_id: recipe.id, name: recipe.name, dose: "1 serving", when_to_take: "After meals", duration: "2 weeks" }]);
    setFoodSearch("");
  };
  const updateFoodPick = (i: number, key: keyof FoodPick, val: string) => {
    const copy = [...foodPicks]; copy[i] = { ...copy[i], [key]: val }; setFoodPicks(copy);
  };
  const removeFoodPick = (i: number) => setFoodPicks(foodPicks.filter((_, idx) => idx !== i));

  const foodMatches = useMemo(() => {
    const term = foodSearch.trim().toLowerCase();
    if (!term) return [];
    return foodRecipes
      .filter((r) => !foodPicks.find((f) => f.recipe_id === r.id))
      .filter((r) => r.name.toLowerCase().includes(term) || r.indications?.some((i) => i.toLowerCase().includes(term)))
      .slice(0, 8);
  }, [foodSearch, foodRecipes, foodPicks]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className={t.label}>Prescription Generator</p>
            <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">
              {caseData?.patient?.full_name ? `Rx for ${caseData.patient.full_name}` : "New Prescription"}
            </h2>
            {caseData?.patient && <p className={`mt-1 text-sm ${t.mutedText}`}>{caseData.patient.age} y · {caseData.patient.gender} · {caseData.patient.chief_complaint}</p>}
          </div>
          <div className="flex items-center gap-2">
            <a href="/essential-homeopathy-drugs" target="_blank" rel="noopener noreferrer" className={t.ghostBtn}>💧 Essential Homeopathy Drug List ↗</a>
            {caseId && <Link to={`/homeo/reports?case=${caseId}`} className={t.ghostBtn}>📄 Export PDF</Link>}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* MAIN COLUMN */}
          <div className="xl:col-span-2 space-y-6">
            <div className={`${t.card} p-5 space-y-4`}>
              <div>
                <label className={t.label}>Remedies</label>
                <div className="mt-2 space-y-3">
                  {list.map((row, i) => (
                    <div key={i} className="grid gap-2 md:grid-cols-12 items-start">
                      <div className="md:col-span-4 flex gap-1">
                        <select className={`${t.input} flex-1`} value={row.remedy_id} onChange={(e) => updateRow(i, "remedy_id", e.target.value)}>
                          <option value="">Select remedy…</option>
                          {remedies.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.abbreviation})</option>)}
                        </select>
                        {row.remedy_id && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" onClick={() => openReference(row.remedy_id)} className="px-2 rounded-md border border-[hsl(45_40%_55%/0.25)] hover:bg-[hsl(45_85%_55%/0.08)]">
                                <BookOpen className="h-4 w-4 text-[hsl(45_85%_70%)]" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Open Materia Medica reference</TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      <div className="md:col-span-2 flex gap-1">
                        <select className={`${t.input} flex-1`} value={row.potency} onChange={(e) => updateRow(i, "potency", e.target.value)}>
                          {POTENCIES.map((p) => <option key={p.value}>{p.value}</option>)}
                        </select>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="px-2 rounded-md border border-[hsl(45_40%_55%/0.25)] hover:bg-[hsl(45_85%_55%/0.08)]">
                              <Info className="h-4 w-4 text-[hsl(45_85%_70%)]" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[260px]">
                            <p className="font-semibold">{row.potency}</p>
                            <p className="text-xs mt-1">{POTENCIES.find((p) => p.value === row.potency)?.tip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <select className={`${t.input} md:col-span-2`} value={row.dosage} onChange={(e) => updateRow(i, "dosage", e.target.value)}>
                        {DOSAGES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <input className={`${t.input} md:col-span-3`} placeholder="Instructions" value={row.instructions} onChange={(e) => updateRow(i, "instructions", e.target.value)} />
                      <button onClick={() => removeRow(i)} disabled={list.length === 1} className="md:col-span-1 inline-flex items-center justify-center rounded-md border border-[hsl(0_70%_55%/0.3)] text-[hsl(0_70%_70%)] py-2 disabled:opacity-30 hover:bg-[hsl(0_70%_55%/0.1)]">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setList([...list, { remedy_id: "", remedy_name: "", potency: "30C", dosage: "Single dose", instructions: "" }])} className={t.ghostBtn}>+ Add row</button>
                    {selectedRemedyIds.length >= 2 && (
                      <button onClick={runDifferentiate} disabled={diffLoading} className={t.primaryBtn}>
                        {diffLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompareArrows className="h-4 w-4" />}
                        {diffLoading ? "Differentiating…" : `AI Differentiate (${selectedRemedyIds.length})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Diet / Antidote restrictions */}
              <div>
                <label className={t.label}>Diet & antidote restrictions</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ANTIDOTES.map((a) => {
                    const active = restrictions.includes(a.label);
                    return (
                      <Tooltip key={a.label}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleRestriction(a.label)}
                            className={`text-xs rounded-full px-3 py-1.5 border transition ${
                              active
                                ? "bg-[hsl(45_85%_55%/0.18)] border-[hsl(45_85%_55%/0.5)] text-[hsl(45_85%_80%)]"
                                : "border-[hsl(45_40%_55%/0.25)] text-[hsl(45_15%_75%)] hover:bg-[hsl(45_85%_55%/0.06)]"
                            }`}
                          >
                            {active ? "✓ " : ""}{a.label}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{a.note}</TooltipContent>
                      </Tooltip>
                    );
                  })}
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

              {/* Food as Medicine — AYUSH diet plan */}
              <div>
                <label className={t.label}>🍲 Food as Medicine — AYUSH diet plan</label>
                <p className={`text-xs ${t.mutedText} mt-1`}>Attach traditional AYUSH recipes to this prescription. Patient sees method, ingredients & benefits in their dashboard.</p>
                <div className="mt-2 relative">
                  <input
                    className={`${t.input} w-full`}
                    placeholder="Search recipes by name or condition (e.g. anaemia, digestion, lactation)…"
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                  />
                  {foodMatches.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-[hsl(45_40%_55%/0.25)] bg-[hsl(160_30%_6%)] shadow-lg max-h-64 overflow-y-auto">
                      {foodMatches.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => addFoodPick(r)}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-[hsl(45_85%_55%/0.08)] border-b border-[hsl(45_40%_55%/0.08)]"
                        >
                          <span className={t.goldText}>{r.name}</span>
                          <span className={`ml-2 text-xs ${t.mutedText}`}>{r.category}{r.indications?.length ? ` · ${r.indications.slice(0, 2).join(", ")}` : ""}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {foodPicks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {foodPicks.map((f, i) => (
                      <div key={f.recipe_id} className="grid gap-2 md:grid-cols-12 items-center rounded-md border border-[hsl(45_40%_55%/0.18)] bg-[hsl(160_30%_5%)] p-2.5">
                        <div className={`md:col-span-3 text-sm ${t.goldText}`}>{f.name}</div>
                        <input className={`${t.input} md:col-span-3`} placeholder="Dose (e.g. 1 cup)" value={f.dose} onChange={(e) => updateFoodPick(i, "dose", e.target.value)} />
                        <input className={`${t.input} md:col-span-3`} placeholder="When (e.g. After meals)" value={f.when_to_take} onChange={(e) => updateFoodPick(i, "when_to_take", e.target.value)} />
                        <input className={`${t.input} md:col-span-2`} placeholder="Duration" value={f.duration} onChange={(e) => updateFoodPick(i, "duration", e.target.value)} />
                        <button onClick={() => removeFoodPick(i)} className="md:col-span-1 inline-flex items-center justify-center rounded-md border border-[hsl(0_70%_55%/0.3)] text-[hsl(0_70%_70%)] py-2 hover:bg-[hsl(0_70%_55%/0.1)]">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={save} disabled={saving} className={t.primaryBtn}>
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Prescription"}
              </button>
            </div>

            {/* AI differentiation result */}
            {diff && (
              <div className={`${t.card} p-5`}>
                <h3 className={`font-display text-lg ${t.goldText} mb-3 flex items-center gap-2`}>
                  <Sparkles className="h-4 w-4" /> AI Remedy Differentiation
                </h3>
                {diff.summary && <p className={`text-sm ${t.mutedText} mb-4 italic`}>“{diff.summary}”</p>}
                <div className="grid gap-3 md:grid-cols-2">
                  {(diff.comparison ?? []).map((c: any, i: number) => (
                    <div key={i} className="rounded-md border border-[hsl(45_85%_55%/0.2)] bg-[hsl(160_30%_6%)] p-4">
                      <p className={`font-display ${t.goldText}`}>{c.remedy}</p>
                      {c.core_picture && <p className={`mt-1 text-xs ${t.mutedText}`}>{c.core_picture}</p>}
                      {c.distinguishing_marks?.length > 0 && (
                        <ul className="mt-2 list-disc pl-4 text-xs space-y-0.5">
                          {c.distinguishing_marks.map((m: string, j: number) => <li key={j}>{m}</li>)}
                        </ul>
                      )}
                      {c.best_when && <p className="mt-2 text-xs"><span className={t.label}>Best when:</span> <span className="ml-1">{c.best_when}</span></p>}
                      {c.avoid_if && <p className="mt-1 text-xs"><span className={t.label}>Avoid if:</span> <span className="ml-1">{c.avoid_if}</span></p>}
                    </div>
                  ))}
                </div>
                {diff.differentiating_questions?.length > 0 && (
                  <div className="mt-4">
                    <p className={t.label}>Ask the patient</p>
                    <ul className="mt-2 list-decimal pl-5 text-sm space-y-1">
                      {diff.differentiating_questions.map((q: string, i: number) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

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

          {/* REFERENCE PANEL */}
          <aside className="xl:col-span-1">
            <div className={`${t.card} p-5 sticky top-4`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-display text-lg ${t.goldText} flex items-center gap-2`}>
                  <BookOpen className="h-4 w-4" /> Materia Medica
                </h3>
                {refRemedy && (
                  <button onClick={() => setRefRemedy(null)} className="text-xs text-[hsl(45_15%_70%)] hover:text-[hsl(45_85%_75%)]">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!refRemedy && (
                <p className={`text-sm ${t.mutedText}`}>
                  Click <BookOpen className="inline h-3.5 w-3.5 -mt-0.5" /> next to any remedy to view its profile here.
                </p>
              )}

              {refLoading && <Loader2 className="h-5 w-5 animate-spin text-[hsl(45_85%_70%)]" />}

              {refRemedy && !refLoading && (
                <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto pr-1">
                  <div>
                    <p className={`font-display text-base ${t.goldText}`}>
                      {refRemedy.name} <span className={`${t.mutedText} text-xs`}>({refRemedy.abbreviation})</span>
                    </p>
                    {refRemedy.common_name && <p className="text-xs italic text-[hsl(142_55%_55%)]">{refRemedy.common_name}</p>}
                    {refRemedy.latin_name && <p className={`text-xs ${t.mutedText}`}>{refRemedy.latin_name}</p>}
                  </div>

                  {refRemedy.short_description && <p className={`text-xs ${t.mutedText}`}>{refRemedy.short_description}</p>}

                  {(refRemedy.keynote_symptoms?.length || refRemedy.keynotes?.length) > 0 && (
                    <div>
                      <p className={t.label}>Keynotes</p>
                      <ul className="mt-1 list-disc pl-4 text-xs space-y-0.5">
                        {(refRemedy.keynote_symptoms?.length ? refRemedy.keynote_symptoms : refRemedy.keynotes).slice(0, 6).map((k: string, i: number) => <li key={i}>{k}</li>)}
                      </ul>
                    </div>
                  )}

                  {refRemedy.mental_emotional_picture && (
                    <div>
                      <p className={t.label}>Mental / Emotional</p>
                      <p className="mt-1 text-xs">{refRemedy.mental_emotional_picture}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {refRemedy.thermal && <div><span className={t.label}>Thermal:</span> <span className="ml-1">{refRemedy.thermal}</span></div>}
                    {refRemedy.thirst && <div><span className={t.label}>Thirst:</span> <span className="ml-1">{refRemedy.thirst}</span></div>}
                    {refRemedy.miasm && <div className="col-span-2"><span className={t.label}>Miasm:</span> <span className="ml-1">{refRemedy.miasm}</span></div>}
                  </div>

                  {refRemedy.modalities_better?.length > 0 && (
                    <div>
                      <p className={t.label}>Better from</p>
                      <p className="mt-1 text-xs">{refRemedy.modalities_better.join(" · ")}</p>
                    </div>
                  )}
                  {refRemedy.modalities_worse?.length > 0 && (
                    <div>
                      <p className={t.label}>Worse from</p>
                      <p className="mt-1 text-xs">{refRemedy.modalities_worse.join(" · ")}</p>
                    </div>
                  )}
                  {refRemedy.food_desires?.length > 0 && (
                    <div>
                      <p className={t.label}>Food desires</p>
                      <p className="mt-1 text-xs">{refRemedy.food_desires.join(", ")}</p>
                    </div>
                  )}
                  {refRemedy.food_aversions?.length > 0 && (
                    <div>
                      <p className={t.label}>Food aversions</p>
                      <p className="mt-1 text-xs">{refRemedy.food_aversions.join(", ")}</p>
                    </div>
                  )}

                  <Link to={`/homeo/materia-medica/${refRemedy.id}`} className={`${t.ghostBtn} w-full justify-center text-xs`}>
                    Open full profile →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>

        <p className={`text-[11px] italic ${t.mutedText} pt-4 border-t border-[hsl(45_40%_55%/0.12)] flex items-center gap-2`}>
          <AlertTriangle className="h-3.5 w-3.5" /> Clinical decision-support only. Final prescription must be made by a qualified homeopathy physician.
        </p>
      </div>
    </TooltipProvider>
  );
};

export default Prescription;
