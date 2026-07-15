import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { toast } from "sonner";
import { FolderOpen, Trash2, ArrowRight } from "lucide-react";

type Saved = {
  id: string;
  title: string;
  notes: string | null;
  selected_rubric_ids: string[];
  ranking_snapshot: any;
  created_at: string;
};

const SavedCases = () => {
  const [items, setItems] = useState<Saved[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("homeo_saved_cases")
      .select("id, title, notes, selected_rubric_ids, ranking_snapshot, created_at")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm("Delete this saved case?")) return;
    const { error } = await supabase.from("homeo_saved_cases").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className={t.label}>Saved Cases</p>
        <h2 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Your repertorisation history</h2>
        <p className={`mt-1 text-sm ${t.mutedText}`}>Reopen any saved case to restore the basket and remedy ranking.</p>
      </div>

      {loading ? (
        <p className={t.mutedText}>Loading…</p>
      ) : items.length === 0 ? (
        <div className={`${t.card} p-10 text-center`}>
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-[hsl(45_85%_60%/0.5)]" />
          <p className="text-[hsl(45_85%_75%)]">No saved cases yet</p>
          <p className={`mt-1 text-sm ${t.mutedText}`}>Build a symptom basket in the Repertory and click <em>Save case</em>.</p>
          <Link to="/homeo/repertory" className={`${t.primaryBtn} mt-4 inline-flex`}>Go to Repertory</Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => {
            const top = Array.isArray(c.ranking_snapshot) ? c.ranking_snapshot.slice(0, 3) : [];
            return (
              <div key={c.id} className={`${t.card} p-5`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-display text-base ${t.goldText}`}>{c.title}</h3>
                    <p className={`mt-0.5 text-xs ${t.mutedText}`}>{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => del(c.id)} className="text-[hsl(0_70%_70%)] hover:text-[hsl(0_70%_60%)]"><Trash2 className="h-4 w-4" /></button>
                </div>
                {c.notes && <p className={`mt-2 text-sm ${t.mutedText} line-clamp-2`}>{c.notes}</p>}
                <p className={`mt-3 text-xs ${t.label}`}>{c.selected_rubric_ids?.length ?? 0} rubrics</p>
                {top.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {top.map((r: any, i: number) => (
                      <li key={i} className="flex justify-between">
                        <span>{i + 1}. {r.name} <span className={t.mutedText}>({r.abbreviation})</span></span>
                        <span className="text-[hsl(142_55%_60%)] font-semibold">{r.total_score}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to={`/homeo/repertory?case=${c.id}`} className={`${t.ghostBtn} mt-4 w-full justify-center text-sm`}>
                  Reopen <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedCases;
