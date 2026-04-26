import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const MateriaMedica = () => {
  const [q, setQ] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const { data } = await supabase
      .from("homeo_remedies")
      .select("id, name, abbreviation, latin_name, short_description, keynotes, thermal, thirst, cravings, modalities_better, modalities_worse")
      .or(`name.ilike.%${q}%,abbreviation.ilike.%${q}%,full_text.ilike.%${q}%,short_description.ilike.%${q}%`)
      .limit(30);
    setList(data ?? []);
    setLoading(false);
    if (!data?.length) toast.message("No remedies found — try a different keyword.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className={t.label}>Materia Medica</p>
        <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Search remedies by symptom or name</h2>
      </div>
      <div className={`${t.card} p-5 flex gap-3`}>
        <input className={t.input} placeholder="e.g. Bryonia, irritability worse motion, headache cold drinks…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
        <button onClick={search} disabled={loading} className={t.primaryBtn}><Sparkles className="h-4 w-4" />{loading ? "Searching…" : "Search"}</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((r) => (
          <div key={r.id} className={`${t.card} p-5`}>
            <div className="flex items-baseline justify-between">
              <h3 className={`font-display text-lg ${t.goldText}`}>{r.name} <span className={`${t.mutedText} text-sm`}>({r.abbreviation})</span></h3>
              <span className="text-xs italic text-[hsl(142_55%_55%)]">{r.latin_name}</span>
            </div>
            {r.short_description && <p className={`mt-2 text-sm ${t.mutedText}`}>{r.short_description}</p>}
            {r.keynotes?.length > 0 && (
              <div className="mt-3">
                <p className={t.label}>Keynotes</p>
                <ul className="mt-1 list-disc pl-4 text-sm">{r.keynotes.slice(0, 5).map((k: string, i: number) => <li key={i}>{k}</li>)}</ul>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {r.thermal && <div><span className={t.label}>Thermal:</span> <span className="ml-1">{r.thermal}</span></div>}
              {r.thirst && <div><span className={t.label}>Thirst:</span> <span className="ml-1">{r.thirst}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MateriaMedica;
