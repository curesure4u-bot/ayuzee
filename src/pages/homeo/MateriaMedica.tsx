import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Sparkles, BookOpen, Database, ArrowRight, GitCompareArrows, Loader2 } from "lucide-react";

interface RemedyRow {
  id: string;
  name: string;
  common_name: string | null;
  abbreviation: string;
  latin_name: string | null;
  short_description: string | null;
  keynotes: string[] | null;
  keynote_symptoms: string[] | null;
  thermal: string | null;
  thirst: string | null;
  detail_level: string | null;
}

const DISCLAIMER =
  "This database is for professional educational and clinical decision-support use only. Final prescription should be made by a qualified homeopathy physician.";

const MateriaMedica = () => {
  const [q, setQ] = useState("");
  const [list, setList] = useState<RemedyRow[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState<"all" | "full" | "placeholder">("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

  const loadAll = async () => {
    setLoading(true);
    const { data, count } = await supabase
      .from("homeo_remedies")
      .select(
        "id, name, common_name, abbreviation, latin_name, short_description, keynotes, keynote_symptoms, thermal, thirst, detail_level",
        { count: "exact" }
      )
      .order("name", { ascending: true })
      .limit(500);
    setList((data as RemedyRow[]) ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const search = async () => {
    if (!q.trim()) { loadAll(); return; }
    setLoading(true);
    setAiSuggestions([]);
    const term = `%${q.trim()}%`;
    const { data } = await supabase
      .from("homeo_remedies")
      .select("id, name, common_name, abbreviation, latin_name, short_description, keynotes, keynote_symptoms, thermal, thirst, detail_level")
      .or(
        `name.ilike.${term},common_name.ilike.${term},abbreviation.ilike.${term},short_description.ilike.${term},mental_emotional_picture.ilike.${term},general_symptoms.ilike.${term}`
      )
      .order("detail_level", { ascending: false })
      .limit(80);
    setList((data as RemedyRow[]) ?? []);
    setLoading(false);
    if (!data?.length) toast.message("No remedies matched — try the AI symptom search.");
  };

  const aiSearch = async () => {
    if (!q.trim()) return toast.error("Type a symptom description");
    setAiLoading(true);
    const { data: candidates } = await supabase
      .from("homeo_remedies")
      .select("name, abbreviation, short_description, keynotes, keynote_symptoms")
      .limit(120);
    const { data, error } = await supabase.functions.invoke("homeo-materia-ai", {
      body: { query: q, candidates: candidates ?? [] },
    });
    setAiLoading(false);
    if (error) return toast.error(error.message);
    if ((data as any)?.error) return toast.error((data as any).error);
    setAiSuggestions((data as any)?.suggestions ?? []);
  };

  const seed = async () => {
    if (!confirm("Seed the Top 200 Homeopathy Materia Medica? 20 remedies get full AI-generated profiles, 180 are added as placeholders. Takes ~2-3 minutes.")) return;
    setSeeding(true);
    const { data, error } = await supabase.functions.invoke("homeo-seed-mm200");
    setSeeding(false);
    if (error) return toast.error(error.message);
    const r = data as any;
    toast.success(`Seeded ${r.detailed} detailed + ${r.placeholders} placeholders (failed ${r.failed})`);
    loadAll();
  };

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((r) => (r.detail_level ?? "placeholder") === filter);
  }, [list, filter]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) { toast.message("Maximum 4 remedies for comparison"); return prev; }
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={t.label}>Ayuzee Homeo Materia Medica AI</p>
          <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Top 200 Remedies — Searchable Database</h2>
          <p className={`mt-1 text-sm ${t.mutedText}`}>
            {total} remedies in library · public-domain style · doctor-curated
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={seed} disabled={seeding} className={t.ghostBtn}>
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {seeding ? "Seeding…" : "Seed Top 200"}
          </button>
          {compareIds.length >= 2 && (
            <Link to={`/homeo/materia-medica/compare?ids=${compareIds.join(",")}`} className={t.primaryBtn}>
              <GitCompareArrows className="h-4 w-4" /> Compare ({compareIds.length})
            </Link>
          )}
        </div>
      </div>

      <div className={`${t.card} p-5 space-y-3`}>
        <input
          className={t.input}
          placeholder="Search by remedy, symptom, modality, mental state… e.g. 'anger from contradiction', 'better open air'"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={search} disabled={loading} className={t.ghostBtn}>
            <BookOpen className="h-4 w-4" />{loading ? "Searching…" : "Text search"}
          </button>
          <button onClick={aiSearch} disabled={aiLoading} className={t.primaryBtn}>
            <Sparkles className="h-4 w-4" />{aiLoading ? "AI thinking…" : "AI Symptom Search"}
          </button>
          <div className="ml-auto flex gap-1 rounded-md border border-[hsl(45_40%_55%/0.25)] p-1 text-xs">
            {(["all", "full", "placeholder"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-3 py-1 transition ${
                  filter === f
                    ? "bg-[hsl(45_85%_55%/0.2)] text-[hsl(45_85%_75%)]"
                    : "text-[hsl(45_15%_70%)] hover:text-[hsl(45_85%_75%)]"
                }`}
              >
                {f === "all" ? "All" : f === "full" ? "Detailed" : "Placeholders"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <div className={`${t.card} p-5`}>
          <h3 className={`font-display text-lg ${t.goldText} mb-3`}>✨ AI suggestions</h3>
          <div className="space-y-3">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="rounded-md border border-[hsl(45_85%_55%/0.2)] bg-[hsl(160_30%_6%)] p-4">
                <div className="flex items-baseline justify-between">
                  <p className={`font-display text-base ${t.goldText}`}>
                    #{i + 1} {s.remedy_name} <span className={`${t.mutedText} text-sm`}>({s.abbreviation})</span>
                  </p>
                  <span className={`${t.pill} text-[10px]`}>{s.confidence} confidence</span>
                </div>
                <p className={`mt-2 text-sm ${t.mutedText}`}>{s.reasoning}</p>
                {s.keynotes_matched?.length > 0 && (
                  <p className="mt-2 text-xs">
                    <span className={t.label}>Matched keynotes:</span>{" "}
                    <span className="ml-1">{s.keynotes_matched.join(" · ")}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => {
          const checked = compareIds.includes(r.id);
          const kn = (r.keynote_symptoms?.length ? r.keynote_symptoms : r.keynotes) ?? [];
          return (
            <div key={r.id} className={`${t.card} p-5 flex flex-col`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className={`font-display text-lg ${t.goldText}`}>
                    {r.name} <span className={`${t.mutedText} text-sm`}>({r.abbreviation})</span>
                  </h3>
                  {r.common_name && <p className="text-xs italic text-[hsl(142_55%_55%)]">{r.common_name}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  r.detail_level === "full"
                    ? "bg-[hsl(142_55%_30%/0.4)] text-[hsl(142_55%_70%)]"
                    : "bg-[hsl(45_15%_30%/0.4)] text-[hsl(45_15%_70%)]"
                }`}>
                  {r.detail_level === "full" ? "DETAILED" : "PLACEHOLDER"}
                </span>
              </div>
              {r.short_description && <p className={`mt-2 text-sm ${t.mutedText} line-clamp-3`}>{r.short_description}</p>}
              {kn.length > 0 && (
                <div className="mt-3">
                  <p className={t.label}>Keynotes</p>
                  <ul className="mt-1 list-disc pl-4 text-sm space-y-0.5">
                    {kn.slice(0, 3).map((k, i) => <li key={i}>{k}</li>)}
                  </ul>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[hsl(45_15%_75%)]">
                {r.thermal && <div><span className={t.label}>Thermal:</span> <span className="ml-1">{r.thermal}</span></div>}
                {r.thirst && <div><span className={t.label}>Thirst:</span> <span className="ml-1">{r.thirst}</span></div>}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-[hsl(45_40%_55%/0.12)]">
                <label className="flex items-center gap-2 text-xs text-[hsl(45_15%_70%)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCompare(r.id)}
                    className="accent-[hsl(45_85%_55%)]"
                  />
                  Compare
                </label>
                <Link
                  to={`/homeo/materia-medica/${r.id}`}
                  className="inline-flex items-center gap-1 text-sm text-[hsl(45_85%_70%)] hover:text-[hsl(45_85%_85%)]"
                >
                  Open profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className={`${t.card} p-8 text-center md:col-span-2 xl:col-span-3`}>
            <p className={t.mutedText}>No remedies yet. Click <strong>Seed Top 200</strong> to populate the library.</p>
          </div>
        )}
      </div>

      <p className={`text-[11px] italic ${t.mutedText} pt-4 border-t border-[hsl(45_40%_55%/0.12)]`}>
        ⚠ {DISCLAIMER}
      </p>
    </div>
  );
};

export default MateriaMedica;
