import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "../lib/ui";
import { Loader2 } from "lucide-react";

const MindReports = () => {
  const [themeStats, setThemeStats] = useState<{ theme: string; count: number }[]>([]);
  const [remedyStats, setRemedyStats] = useState<{ remedy: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase.from("homeo_mind_cases")
        .select("detected_themes, suggested_remedy, doctor_final_remedy")
        .eq("doctor_user_id", uid);
      const cases = data ?? [];
      setTotal(cases.length);

      const themeMap = new Map<string, number>();
      const remedyMap = new Map<string, number>();
      for (const c of cases) {
        for (const th of c.detected_themes ?? []) themeMap.set(th, (themeMap.get(th) ?? 0) + 1);
        const r = c.doctor_final_remedy || c.suggested_remedy;
        if (r) remedyMap.set(r, (remedyMap.get(r) ?? 0) + 1);
      }
      setThemeStats([...themeMap.entries()].map(([theme, count]) => ({ theme, count })).sort((a, b) => b.count - a.count));
      setRemedyStats([...remedyMap.entries()].map(([remedy, count]) => ({ remedy, count })).sort((a, b) => b.count - a.count).slice(0, 15));
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-[hsl(45_85%_60%)]" />;

  const maxTheme = Math.max(...themeStats.map((t) => t.count), 1);
  const maxRemedy = Math.max(...remedyStats.map((r) => r.count), 1);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <p className={t.label}>Mind Case · Insights</p>
        <h1 className="font-display text-2xl font-semibold text-[hsl(45_85%_78%)]">Patterns across {total} cases</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={`${t.card} p-5`}>
          <p className={t.label}>Most common emotional themes</p>
          <div className="space-y-2 mt-4">
            {themeStats.length === 0 ? <p className={t.mutedText}>No data yet.</p> : themeStats.map((s) => (
              <div key={s.theme}>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(45_30%_92%)] capitalize">{s.theme}</span>
                  <span className="text-[hsl(45_85%_70%)]">{s.count}</span>
                </div>
                <div className="h-2 bg-[hsl(160_30%_8%)] rounded mt-1">
                  <div className="h-full rounded bg-gradient-to-r from-[hsl(142_55%_38%)] to-[hsl(45_85%_55%)]" style={{ width: `${(s.count / maxTheme) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${t.card} p-5`}>
          <p className={t.label}>Most prescribed remedies</p>
          <div className="space-y-2 mt-4">
            {remedyStats.length === 0 ? <p className={t.mutedText}>No data yet.</p> : remedyStats.map((s) => (
              <div key={s.remedy}>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(45_30%_92%)]">{s.remedy}</span>
                  <span className="text-[hsl(45_85%_70%)]">{s.count}</span>
                </div>
                <div className="h-2 bg-[hsl(160_30%_8%)] rounded mt-1">
                  <div className="h-full rounded bg-gradient-to-r from-[hsl(142_55%_38%)] to-[hsl(45_85%_55%)]" style={{ width: `${(s.count / maxRemedy) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindReports;
