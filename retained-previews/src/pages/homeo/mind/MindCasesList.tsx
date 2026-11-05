import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "../lib/ui";
import { Loader2 } from "lucide-react";

const MindCasesList = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      let q = supabase.from("homeo_mind_cases").select("*").eq("doctor_user_id", uid).order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data } = await q;
      setCases(data ?? []);
      setLoading(false);
    })();
  }, [filter]);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className={t.label}>Mind Case · Library</p>
          <h1 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Active cases</h1>
        </div>
        <div className="flex gap-2">
          {(["active", "closed", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs uppercase tracking-wider ${filter === f ? "bg-[hsl(45_85%_55%/0.2)] text-[hsl(45_85%_75%)]" : "text-[hsl(45_15%_70%)] hover:bg-[hsl(45_85%_55%/0.08)]"}`}>
              {f}
            </button>
          ))}
          <Link to="/homeo/mind/new" className={t.primaryBtn}>+ New</Link>
        </div>
      </div>

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-[hsl(45_85%_60%)]" />
      ) : cases.length === 0 ? (
        <div className={`${t.card} p-8 text-center`}>
          <p className={t.mutedText}>No {filter} cases.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cases.map((c) => (
            <Link key={c.id} to={`/homeo/mind/cases/${c.id}`} className={`${t.card} p-4 hover:border-[hsl(45_85%_55%/0.4)]`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[hsl(45_85%_78%)]">{c.patient_name || "Unnamed"}{c.patient_age ? ` · ${c.patient_age}y` : ""}{c.patient_gender ? ` · ${c.patient_gender}` : ""}</p>
                  <p className={`${t.mutedText} text-xs mt-0.5 line-clamp-2`}>{c.chief_complaint || c.bothers_most || "—"}</p>
                </div>
                {c.suggested_remedy && <span className={t.pill}>{c.suggested_remedy}</span>}
              </div>
              {c.detected_themes?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {c.detected_themes.slice(0, 5).map((th: string) => (
                    <span key={th} className="text-[10px] uppercase tracking-wider bg-[hsl(142_55%_30%/0.3)] text-[hsl(142_60%_75%)] px-2 py-0.5 rounded">
                      {th}
                    </span>
                  ))}
                </div>
              )}
              <p className={`text-[10px] uppercase tracking-wider ${t.mutedText} mt-3`}>
                {new Date(c.created_at).toLocaleDateString()} · {c.status}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MindCasesList;
