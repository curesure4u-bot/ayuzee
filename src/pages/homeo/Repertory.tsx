import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Search, X, Sparkles, Save, BookOpen } from "lucide-react";

type Rubric = {
  id: string;
  chapter: string;
  subcategory: string | null;
  rubric: string;
  sub_rubric: string | null;
  body_location: string | null;
  sensation: string | null;
  modalities_better: string[] | null;
  modalities_worse: string[] | null;
  symptom_keywords: string[] | null;
};

type RankRow = {
  remedy_id: string;
  abbreviation: string;
  name: string;
  total_score: number;
  rubrics_covered: number;
  max_grade: number;
};

const CHAPTERS = ["Mind","Head","EENT","Digestive","Abdomen","Urinary","Female","Male","Respiratory","Musculoskeletal","Skin","Sleep","Generalities","Pediatrics","Vertigo","Eye","Ear","Nose","Face","Mouth","Throat","Stomach","Rectum","Stool","Genitalia","Larynx","Cough","Chest","Back","Extremities","Chill","Fever","Perspiration"];

const Repertory = () => {
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [chapter, setChapter] = useState("");
  const [results, setResults] = useState<Rubric[]>([]);
  const [selected, setSelected] = useState<Rubric[]>([]);
  const [ranked, setRanked] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(false);

  // AI natural-language search
  const [nlQuery, setNlQuery] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlPhrases, setNlPhrases] = useState<string[]>([]);

  // Save case
  const [saveOpen, setSaveOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState("");
  const [caseNotes, setCaseNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Load saved-case if linked from /homeo/saved-cases
  useEffect(() => {
    const caseId = params.get("case");
    if (!caseId) return;
    (async () => {
      const { data } = await supabase.from("homeo_saved_cases").select("title, notes, selected_rubric_ids").eq("id", caseId).maybeSingle();
      if (!data) return;
      setCaseTitle(data.title);
      setCaseNotes(data.notes ?? "");
      const ids = data.selected_rubric_ids ?? [];
      if (ids.length) {
        const { data: rs } = await supabase.from("homeo_symptoms").select("*").in("id", ids);
        setSelected(rs ?? []);
      }
    })();
  }, [params]);

  // Debounced text search
  useEffect(() => {
    const run = setTimeout(async () => {
      if (q.trim().length < 2 && !chapter) return setResults([]);
      let query = supabase
        .from("homeo_symptoms")
        .select("id, chapter, subcategory, rubric, sub_rubric, body_location, sensation, modalities_better, modalities_worse, symptom_keywords")
        .limit(40);
      if (chapter) query = query.eq("chapter", chapter);
      if (q.trim().length >= 2) {
        const term = q.trim().replace(/[%_]/g, " ");
        query = query.ilike("search_text", `%${term}%`);
      }
      const { data } = await query;
      setResults(data ?? []);
    }, 250);
    return () => clearTimeout(run);
  }, [q, chapter]);

  // Auto-rank when basket changes
  useEffect(() => {
    if (!selected.length) { setRanked([]); return; }
    (async () => {
      const { data } = await supabase.rpc("homeo_repertorize", { _symptom_ids: selected.map((s) => s.id) });
      setRanked((data as RankRow[]) ?? []);
    })();
  }, [selected]);

  const add = (s: Rubric) => {
    if (selected.find((x) => x.id === s.id)) return;
    setSelected((prev) => [...prev, s]);
  };
  const remove = (id: string) => setSelected((prev) => prev.filter((s) => s.id !== id));
  const clear = () => { setSelected([]); setRanked([]); };

  const aiFind = async () => {
    if (!nlQuery.trim()) return toast.error("Describe the case in your own words");
    setNlLoading(true);
    setNlPhrases([]);
    const { data, error } = await supabase.functions.invoke("homeo-rubric-finder", { body: { query: nlQuery } });
    setNlLoading(false);
    if (error) return toast.error(error.message);
    if ((data as any)?.error) return toast.error((data as any).error);
    setNlPhrases((data as any)?.phrases ?? []);
    const rubrics: Rubric[] = (data as any)?.rubrics ?? [];
    if (!rubrics.length) return toast.message("No rubrics matched. Try the text search.");
    // Add unique into basket
    setSelected((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      for (const r of rubrics) if (!existing.has(r.id)) merged.push(r);
      return merged;
    });
    toast.success(`Added ${rubrics.length} matching rubrics to the basket`);
  };

  const saveCase = async () => {
    if (!caseTitle.trim()) return toast.error("Title required");
    if (!selected.length) return toast.error("Add some rubrics first");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("homeo_saved_cases").insert({
      doctor_user_id: u.user!.id,
      title: caseTitle.trim(),
      notes: caseNotes.trim() || null,
      selected_rubric_ids: selected.map((s) => s.id),
      ranking_snapshot: ranked.slice(0, 10) as any,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Case saved");
    setSaveOpen(false);
  };

  const stats = useMemo(() => ({
    rubrics: selected.length,
    chapters: new Set(selected.map((s) => s.chapter)).size,
  }), [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={t.label}>Repertory Engine</p>
          <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Search rubrics · Build basket · Rank remedies</h2>
        </div>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => setSaveOpen(true)} className={t.ghostBtn}><Save className="h-4 w-4" /> Save case</button>
            <button onClick={clear} className={t.dangerBtn}>Clear basket</button>
          </div>
        )}
      </div>

      {/* AI Rubric Finder */}
      <div className={`${t.card} p-5`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(45_85%_60%)]" />
          <p className={t.label}>AI Rubric Finder · natural language</p>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            className={`${t.input} flex-1`}
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aiFind()}
            placeholder="e.g. sad in closed room, better open air, anxious before exam, headache worse sunlight"
          />
          <button onClick={aiFind} disabled={nlLoading} className={t.primaryBtn}>
            {nlLoading ? "Thinking…" : "Find rubrics"}
          </button>
        </div>
        {nlPhrases.length > 0 && (
          <p className={`mt-2 text-xs ${t.mutedText}`}>
            Extracted: {nlPhrases.map((p) => <span key={p} className="ml-1 inline-block rounded bg-[hsl(45_85%_55%/0.1)] px-2 py-0.5 text-[hsl(45_85%_75%)]">{p}</span>)}
          </p>
        )}
      </div>

      {/* Filters + manual search */}
      <div className={`${t.card} p-5`}>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div>
            <label className={t.label}>Search rubrics (text · keyword · modality)</label>
            <div className="mt-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[hsl(45_40%_55%/0.6)]" />
              <input
                className={`${t.input} pl-9`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g. anxiety, headache sunlight, back pressure, anger contradiction"
              />
            </div>
          </div>
          <div>
            <label className={t.label}>Chapter</label>
            <select className={`${t.input} mt-1`} value={chapter} onChange={(e) => setChapter(e.target.value)}>
              <option value="">All chapters</option>
              {CHAPTERS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {results.length > 0 && (
          <ul className="mt-3 max-h-80 overflow-y-auto rounded-md border border-[hsl(45_40%_55%/0.2)] bg-[hsl(160_30%_6%)]">
            {results.map((r) => (
              <li key={r.id} className="border-b border-[hsl(45_40%_55%/0.08)] last:border-b-0">
                <button onClick={() => add(r)} className="w-full px-3 py-2.5 text-left text-sm hover:bg-[hsl(45_85%_55%/0.08)]">
                  <div className="flex items-baseline gap-2">
                    <span className={`${t.goldText} text-[11px] uppercase tracking-wider`}>{r.chapter}{r.subcategory ? ` · ${r.subcategory}` : ""}</span>
                  </div>
                  <p className="mt-0.5">{r.rubric}{r.sub_rubric ? <span className={t.mutedText}> — {r.sub_rubric}</span> : null}</p>
                  {(r.modalities_worse?.length || r.modalities_better?.length) ? (
                    <p className="mt-1 flex flex-wrap gap-1 text-[10px]">
                      {r.modalities_worse?.map((m) => <span key={"w"+m} className="rounded bg-[hsl(0_60%_55%/0.15)] px-1.5 py-0.5 text-[hsl(0_60%_75%)]">↓ {m}</span>)}
                      {r.modalities_better?.map((m) => <span key={"b"+m} className="rounded bg-[hsl(142_55%_40%/0.2)] px-1.5 py-0.5 text-[hsl(142_55%_70%)]">↑ {m}</span>)}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Symptom basket */}
      {selected.length > 0 && (
        <div className={`${t.card} p-5`}>
          <div className="flex items-center justify-between">
            <p className={t.label}>Selected symptom basket · {stats.rubrics} rubrics across {stats.chapters} chapters</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((s) => (
              <span key={s.id} className={`${t.pill} pr-1`}>
                <span className="text-[10px] opacity-70 mr-1">{s.chapter}</span>
                {s.rubric}{s.sub_rubric ? ` — ${s.sub_rubric}` : ""}
                <button onClick={() => remove(s.id)} className="ml-1 rounded-full p-0.5 hover:bg-[hsl(0_70%_55%/0.2)]"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ranking */}
      {ranked.length > 0 && (
        <div className={`${t.card} p-5`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className={`font-display text-lg ${t.goldText}`}>Top remedies</h3>
            <p className={`text-xs ${t.mutedText}`}>Weighted score (grade 1-4) · {ranked.length} remedies</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[hsl(45_85%_60%/0.85)] text-xs uppercase tracking-wider">
              <th className="py-2 w-12">#</th><th>Remedy</th><th className="text-center w-24">Rubrics</th><th className="text-center w-20">Max</th><th className="text-right pr-2 w-20">Score</th>
            </tr></thead>
            <tbody>
              {ranked.slice(0, 15).map((r, i) => (
                <tr key={r.remedy_id} className="border-t border-[hsl(45_40%_55%/0.12)]">
                  <td className="py-2 text-[hsl(45_85%_70%)]">{i + 1}</td>
                  <td className="font-medium">
                    {r.name} <span className={`${t.mutedText} text-xs`}>({r.abbreviation})</span>
                  </td>
                  <td className="text-center">{r.rubrics_covered}/{selected.length}</td>
                  <td className="text-center"><span className="rounded bg-[hsl(45_85%_55%/0.15)] px-2 py-0.5 text-xs text-[hsl(45_85%_75%)]">{r.max_grade}</span></td>
                  <td className="text-right pr-2 text-[hsl(142_55%_60%)] font-semibold">{r.total_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <BookOpen className="h-3.5 w-3.5 text-[hsl(45_85%_60%)]" />
            <span className={t.mutedText}>Click a remedy in Materia Medica for full keynotes & comparison.</span>
          </div>
        </div>
      )}

      {/* Save case modal */}
      {saveOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setSaveOpen(false)}>
          <div className={`${t.card} w-full max-w-md p-5`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`font-display text-lg ${t.goldText} mb-3`}>Save case</h3>
            <label className={t.label}>Title</label>
            <input className={`${t.input} mt-1`} value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} placeholder="e.g. Mr. Sharma · acidity + anger" />
            <label className={`${t.label} mt-3 block`}>Notes (optional)</label>
            <textarea className={`${t.input} mt-1`} rows={3} value={caseNotes} onChange={(e) => setCaseNotes(e.target.value)} />
            <p className={`mt-2 text-xs ${t.mutedText}`}>Saving {selected.length} rubrics + top {Math.min(10, ranked.length)} remedies.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSaveOpen(false)} className={t.ghostBtn}>Cancel</button>
              <button onClick={saveCase} disabled={saving} className={t.primaryBtn}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repertory;
