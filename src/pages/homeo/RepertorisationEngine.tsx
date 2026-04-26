import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Search, X, Star, Zap, Trash2, Loader2, BookOpen, Trophy } from "lucide-react";

type RubricRemedy = { abbr?: string; abbreviation?: string; name: string; grade: number };
type Rubric = {
  id: string;
  chapter: string;
  section: string | null;
  rubric: string;
  sub_rubric: string | null;
  full_path: string;
  remedies: RubricRemedy[];
  remedy_count: number;
  is_small_rubric: boolean;
};
type Selection = {
  id?: string;
  rubric_id: string;
  doctor_grade: number;
  is_srp: boolean;
  is_keynote: boolean;
  doctor_note?: string | null;
  rubric: Rubric;
};
type RankRow = {
  abbreviation: string;
  remedy_name: string;
  total_score: number;
  rubrics_covered: number;
  total_rubrics: number;
  coverage_pct: number;
  max_grade: number;
  srp_hits: number;
};

const CHAPTERS = ["Mind","Generalities","Head","Eye","Ear","Nose","Face","Mouth","Throat","Stomach","Abdomen","Rectum","Stool","Urinary","Genitalia","Female","Male","Larynx","Cough","Chest","Back","Extremities","Sleep","Dreams","Chill","Fever","Perspiration","Skin","Vertigo"];

const GRADE_COLORS: Record<number, string> = {
  1: "bg-[hsl(45_15%_25%)] text-[hsl(45_15%_75%)]",
  2: "bg-[hsl(45_60%_35%)] text-[hsl(45_30%_94%)]",
  3: "bg-[hsl(45_85%_50%)] text-[hsl(160_30%_8%)]",
  4: "bg-gradient-to-br from-[hsl(45_85%_55%)] to-[hsl(15_85%_55%)] text-[hsl(160_30%_8%)] font-bold",
};

const GradePicker = ({ value, onChange, size = "sm" }: { value: number; onChange: (n: number) => void; size?: "sm" | "md" }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4].map((g) => (
      <button
        key={g}
        onClick={() => onChange(g)}
        className={`grid place-items-center rounded transition ${size === "sm" ? "h-6 w-6 text-[11px]" : "h-7 w-7 text-xs"} ${
          g === value ? GRADE_COLORS[g] : "border border-[hsl(45_40%_55%/0.2)] text-[hsl(45_15%_60%)] hover:border-[hsl(45_85%_55%/0.5)]"
        }`}
        title={`Doctor grade ${g}`}
      >
        {g}
      </button>
    ))}
  </div>
);

const RepertorisationEngine = () => {
  const [params] = useSearchParams();
  const caseId = params.get("case");
  const [q, setQ] = useState("");
  const [chapter, setChapter] = useState("");
  const [results, setResults] = useState<Rubric[]>([]);
  const [searching, setSearching] = useState(false);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [ranked, setRanked] = useState<RankRow[]>([]);
  const [ranking, setRanking] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setDoctorId(data.user?.id ?? null));
  }, []);

  // Load existing selections for the case
  const loadSelections = useCallback(async () => {
    if (!caseId) return;
    const { data, error } = await supabase
      .from("case_rubric_selections")
      .select("id, rubric_id, doctor_grade, is_srp, is_keynote, doctor_note, rubric:homeopathy_rubrics(*)")
      .eq("case_id", caseId);
    if (error) { toast.error(error.message); return; }
    setSelections((data ?? []).map((d: any) => ({ ...d, rubric: d.rubric })) as Selection[]);
  }, [caseId]);

  useEffect(() => { loadSelections(); }, [loadSelections]);

  // Debounced full-text rubric search
  useEffect(() => {
    const handle = setTimeout(async () => {
      if (q.trim().length < 2 && !chapter) { setResults([]); return; }
      setSearching(true);
      let query = supabase.from("homeopathy_rubrics").select("*").eq("is_active", true).limit(50);
      if (chapter) query = query.eq("chapter", chapter);
      if (q.trim().length >= 2) {
        const term = q.trim().replace(/[%_]/g, " ");
        query = query.ilike("search_text", `%${term.toLowerCase()}%`);
      }
      const { data, error } = await query.order("remedy_count", { ascending: false });
      setSearching(false);
      if (error) { toast.error(error.message); return; }
      setResults((data ?? []) as Rubric[]);
    }, 250);
    return () => clearTimeout(handle);
  }, [q, chapter]);

  // Run repertorisation when selections change
  const runRepertorisation = useCallback(async () => {
    if (!caseId || !selections.length) { setRanked([]); return; }
    setRanking(true);
    const { data, error } = await supabase.rpc("repertorize_case", { _case_id: caseId });
    setRanking(false);
    if (error) { toast.error(error.message); return; }
    setRanked((data ?? []) as RankRow[]);
  }, [caseId, selections.length]);

  useEffect(() => { runRepertorisation(); }, [runRepertorisation]);

  const addRubric = async (r: Rubric) => {
    if (!caseId) return toast.error("Open this from a case (use the Case Form first)");
    if (!doctorId) return toast.error("Sign in required");
    if (selections.find((s) => s.rubric_id === r.id)) return toast.message("Already in basket");
    const { data, error } = await supabase.from("case_rubric_selections")
      .insert({ case_id: caseId, rubric_id: r.id, doctor_user_id: doctorId, doctor_grade: 2 })
      .select("id, rubric_id, doctor_grade, is_srp, is_keynote, doctor_note")
      .single();
    if (error) { toast.error(error.message); return; }
    setSelections((prev) => [...prev, { ...(data as any), rubric: r } as Selection]);
  };

  const updateSelection = async (id: string, patch: Partial<Selection>) => {
    setSelections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const { error } = await supabase.from("case_rubric_selections").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  const removeSelection = async (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("case_rubric_selections").delete().eq("id", id);
  };

  const clearAll = async () => {
    if (!caseId || !confirm("Clear entire basket?")) return;
    await supabase.from("case_rubric_selections").delete().eq("case_id", caseId);
    setSelections([]);
  };

  const stats = useMemo(() => ({
    rubrics: selections.length,
    chapters: new Set(selections.map((s) => s.rubric.chapter)).size,
    srp: selections.filter((s) => s.is_srp).length,
    keynotes: selections.filter((s) => s.is_keynote).length,
  }), [selections]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={t.label}>Repertorisation Engine</p>
          <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Search · Grade · Mark SRP · Rank remedies</h2>
          <p className={`${t.mutedText} mt-1 text-sm`}>
            Score = Σ (remedy grade × doctor grade × SRP×2 × keynote×1.5)
          </p>
        </div>
        {!caseId && (
          <p className="rounded-md border border-[hsl(0_70%_55%/0.4)] bg-[hsl(0_70%_55%/0.1)] px-3 py-2 text-xs text-[hsl(0_60%_80%)]">
            Open from a saved case (<code className="font-mono">?case=&lt;id&gt;</code>) to persist selections.
          </p>
        )}
      </div>

      {/* Stats strip */}
      {selections.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Rubrics" value={stats.rubrics} />
          <Stat label="Chapters" value={stats.chapters} />
          <Stat label="SRP" value={stats.srp} accent="srp" />
          <Stat label="Keynotes" value={stats.keynotes} accent="key" />
        </div>
      )}

      {/* Search */}
      <div className={`${t.card} p-5`}>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div>
            <label className={t.label}>Rubric search · full-text</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[hsl(45_40%_55%/0.6)]" />
              <input
                className={`${t.input} pl-9`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="anxiety anticipation, headache sun, salt desire, consolation aggravates"
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

        {searching && <p className={`${t.mutedText} mt-3 text-xs`}>Searching…</p>}
        {results.length > 0 && (
          <ul className="mt-3 max-h-96 overflow-y-auto rounded-md border border-[hsl(45_40%_55%/0.2)] bg-[hsl(160_30%_6%)]">
            {results.map((r) => {
              const inBasket = selections.some((s) => s.rubric_id === r.id);
              return (
                <li key={r.id} className="border-b border-[hsl(45_40%_55%/0.08)] last:border-b-0">
                  <button
                    onClick={() => addRubric(r)}
                    disabled={inBasket}
                    className={`w-full px-3 py-2.5 text-left transition ${inBasket ? "opacity-50" : "hover:bg-[hsl(45_85%_55%/0.06)]"}`}
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-[hsl(45_85%_60%/0.85)]">{r.chapter}</span>
                      {r.is_small_rubric && <span className="rounded bg-[hsl(280_60%_55%/0.18)] px-1.5 py-0.5 text-[10px] uppercase text-[hsl(280_70%_80%)]">small rubric</span>}
                      <span className="text-[10px] text-[hsl(45_15%_60%)]">{r.remedy_count} remedies</span>
                    </div>
                    <p className="mt-0.5 text-sm text-[hsl(45_30%_94%)]">
                      {r.rubric}{r.sub_rubric ? <span className={t.mutedText}> — {r.sub_rubric}</span> : null}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {r.remedies.slice(0, 8).map((rem, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${GRADE_COLORS[rem.grade] ?? GRADE_COLORS[1]}`}>
                          {rem.abbr || rem.abbreviation || rem.name} <span className="opacity-70">·{rem.grade}</span>
                        </span>
                      ))}
                      {r.remedies.length > 8 && <span className="text-[10px] text-[hsl(45_15%_60%)]">+{r.remedies.length - 8}</span>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Symptom basket with grading */}
      {selections.length > 0 && (
        <div className={`${t.card} p-5`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className={`font-display text-lg ${t.goldText}`}>Symptom basket</h3>
            <button onClick={clearAll} className={t.dangerBtn}><Trash2 className="h-3.5 w-3.5" /> Clear all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[hsl(45_85%_60%/0.85)]">
                  <th className="py-2">Rubric</th>
                  <th className="w-32 text-center">Doctor grade</th>
                  <th className="w-16 text-center">SRP</th>
                  <th className="w-16 text-center">Keynote</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {selections.map((s) => (
                  <tr key={s.id} className="border-t border-[hsl(45_40%_55%/0.12)] align-top">
                    <td className="py-2.5 pr-3">
                      <p className="text-[10px] uppercase tracking-wider text-[hsl(45_85%_60%/0.7)]">{s.rubric.chapter}</p>
                      <p className="text-sm text-[hsl(45_30%_94%)]">{s.rubric.rubric}{s.rubric.sub_rubric ? ` — ${s.rubric.sub_rubric}` : ""}</p>
                      <p className={`mt-0.5 text-[11px] ${t.mutedText}`}>{s.rubric.remedy_count} remedies in rubric</p>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <GradePicker value={s.doctor_grade} onChange={(g) => updateSelection(s.id!, { doctor_grade: g })} />
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => updateSelection(s.id!, { is_srp: !s.is_srp })}
                        className={`grid h-7 w-7 place-items-center rounded transition ${
                          s.is_srp
                            ? "bg-gradient-to-br from-[hsl(280_70%_55%)] to-[hsl(320_70%_55%)] text-white shadow-[0_0_12px_hsl(280_70%_55%/0.5)]"
                            : "border border-[hsl(45_40%_55%/0.2)] text-[hsl(45_15%_60%)] hover:border-[hsl(280_70%_55%/0.6)]"
                        }`}
                        title="Strange · Rare · Peculiar (×2)"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => updateSelection(s.id!, { is_keynote: !s.is_keynote })}
                        className={`grid h-7 w-7 place-items-center rounded transition ${
                          s.is_keynote
                            ? "bg-gradient-to-br from-[hsl(45_85%_55%)] to-[hsl(35_85%_55%)] text-[hsl(160_30%_8%)] shadow-[0_0_12px_hsl(45_85%_55%/0.5)]"
                            : "border border-[hsl(45_40%_55%/0.2)] text-[hsl(45_15%_60%)] hover:border-[hsl(45_85%_55%/0.6)]"
                        }`}
                        title="Keynote symptom (×1.5)"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td>
                      <button onClick={() => removeSelection(s.id!)} className="text-[hsl(0_60%_70%)] hover:text-[hsl(0_70%_80%)]">
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ranking */}
      {selections.length > 0 && (
        <div className={`${t.card} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[hsl(45_85%_60%)]" />
              <h3 className={`font-display text-lg ${t.goldText}`}>Ranked remedies</h3>
              {ranking && <Loader2 className="h-4 w-4 animate-spin text-[hsl(45_85%_60%)]" />}
            </div>
            <p className={`text-xs ${t.mutedText}`}>{ranked.length} remedies · sorted by coverage then weighted score</p>
          </div>

          {ranked.length === 0 && !ranking && (
            <p className={`${t.mutedText} text-sm`}>No matching remedies yet — adjust grades or add more rubrics.</p>
          )}

          {ranked.length > 0 && (
            <div className="space-y-2">
              {ranked.slice(0, 20).map((r, i) => {
                const top = i === 0;
                return (
                  <div
                    key={r.abbreviation + i}
                    className={`group rounded-lg border p-3 transition ${
                      top
                        ? "border-[hsl(45_85%_55%/0.6)] bg-gradient-to-r from-[hsl(45_85%_55%/0.12)] to-transparent shadow-[0_0_24px_-8px_hsl(45_85%_55%/0.4)]"
                        : "border-[hsl(45_40%_55%/0.18)] hover:border-[hsl(45_85%_55%/0.35)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${
                        top ? "bg-gradient-to-br from-[hsl(45_85%_55%)] to-[hsl(35_85%_50%)] text-[hsl(160_30%_8%)]" : "bg-[hsl(160_30%_8%)] text-[hsl(45_85%_70%)] border border-[hsl(45_40%_55%/0.25)]"
                      }`}>{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <p className="font-display text-base font-semibold text-[hsl(45_85%_82%)]">{r.remedy_name}</p>
                          <span className={`${t.mutedText} text-xs`}>{r.abbreviation}</span>
                          {r.srp_hits > 0 && (
                            <span className="inline-flex items-center gap-1 rounded bg-[hsl(280_70%_55%/0.18)] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[hsl(280_70%_82%)]">
                              <Zap className="h-3 w-3" /> {r.srp_hits} SRP
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 rounded ${GRADE_COLORS[r.max_grade] ?? GRADE_COLORS[1]} px-1.5 py-0.5 text-[10px] uppercase tracking-wider`}>
                            max {r.max_grade}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(160_30%_8%)]">
                            <div
                              className="h-full bg-gradient-to-r from-[hsl(142_55%_50%)] to-[hsl(45_85%_55%)] transition-all"
                              style={{ width: `${Math.min(100, r.coverage_pct)}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-[hsl(45_85%_70%)]">
                            {r.rubrics_covered}/{r.total_rubrics} · {r.coverage_pct}%
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] uppercase tracking-wider text-[hsl(45_85%_60%/0.85)]">Score</p>
                        <p className="font-display text-xl font-semibold text-[hsl(142_55%_65%)] tabular-nums">{Number(r.total_score).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 border-t border-[hsl(45_40%_55%/0.12)] pt-3 text-xs">
            <BookOpen className="h-3.5 w-3.5 text-[hsl(45_85%_60%)]" />
            <span className={t.mutedText}>
              Open Materia Medica for keynotes & comparison. Final remedy decision rests with the prescribing physician.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: number; accent?: "srp" | "key" }) => (
  <div className={`${t.card} p-4`}>
    <p className="text-[10px] uppercase tracking-wider text-[hsl(45_85%_60%/0.85)]">{label}</p>
    <p className={`font-display text-2xl ${
      accent === "srp" ? "text-[hsl(280_70%_75%)]" : accent === "key" ? "text-[hsl(45_85%_72%)]" : "text-[hsl(45_30%_94%)]"
    }`}>{value}</p>
  </div>
);

export default RepertorisationEngine;
