import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

const Repertory = () => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [ranked, setRanked] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = setTimeout(async () => {
      if (q.trim().length < 2) return setResults([]);
      const { data } = await supabase
        .from("homeo_symptoms")
        .select("id, chapter, rubric, sub_rubric")
        .or(`rubric.ilike.%${q}%,sub_rubric.ilike.%${q}%`)
        .limit(20);
      setResults(data ?? []);
    }, 250);
    return () => clearTimeout(run);
  }, [q]);

  const add = (s: any) => {
    if (selected.find((x) => x.id === s.id)) return;
    setSelected([...selected, s]);
    setQ("");
    setResults([]);
  };

  const remove = (id: string) => setSelected(selected.filter((s) => s.id !== id));

  const rank = async () => {
    if (!selected.length) return toast.error("Add at least one rubric");
    setLoading(true);
    const { data, error } = await supabase.rpc("homeo_repertorize", { _symptom_ids: selected.map((s) => s.id) });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRanked(data ?? []);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className={t.label}>Repertory Engine</p>
        <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Rank remedies by symptoms</h2>
      </div>
      <div className={`${t.card} p-5`}>
        <label className={t.label}>Search rubrics</label>
        <div className="mt-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[hsl(45_40%_55%/0.6)]" />
          <input className={`${t.input} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. anxiety, headache, vertigo…" />
        </div>
        {results.length > 0 && (
          <ul className="mt-2 max-h-64 overflow-y-auto rounded-md border border-[hsl(45_40%_55%/0.2)] bg-[hsl(160_30%_6%)]">
            {results.map((r) => (
              <li key={r.id}>
                <button onClick={() => add(r)} className="w-full px-3 py-2 text-left text-sm hover:bg-[hsl(45_85%_55%/0.08)]">
                  <span className={t.goldText}>{r.chapter}</span> · {r.rubric}{r.sub_rubric ? ` — ${r.sub_rubric}` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 && (
        <div className={`${t.card} p-5`}>
          <p className={t.label}>Selected rubrics ({selected.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.map((s) => (
              <span key={s.id} className={`${t.pill} pr-1`}>
                {s.rubric}
                <button onClick={() => remove(s.id)} className="ml-1 rounded-full p-0.5 hover:bg-[hsl(0_70%_55%/0.2)]"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <button onClick={rank} disabled={loading} className={`${t.primaryBtn} mt-4`}>{loading ? "Ranking…" : "Repertorize"}</button>
        </div>
      )}

      {ranked.length > 0 && (
        <div className={`${t.card} p-5`}>
          <h3 className={`font-display text-lg ${t.goldText} mb-3`}>Top remedies</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[hsl(45_85%_60%/0.85)] text-xs uppercase tracking-wider">
              <th className="py-2">Rank</th><th>Remedy</th><th>Rubrics</th><th>Score</th>
            </tr></thead>
            <tbody>
              {ranked.map((r, i) => (
                <tr key={r.remedy_id} className="border-t border-[hsl(45_40%_55%/0.12)]">
                  <td className="py-2 text-[hsl(45_85%_70%)]">#{i + 1}</td>
                  <td className="font-medium">{r.name} <span className={`${t.mutedText} text-xs`}>({r.abbreviation})</span></td>
                  <td>{r.rubrics_covered}/{selected.length}</td>
                  <td className="text-[hsl(142_55%_60%)] font-semibold">{r.total_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Repertory;
