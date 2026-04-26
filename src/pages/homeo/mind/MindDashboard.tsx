import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "../lib/ui";
import { Brain, Plus, ListChecks, CalendarCheck, FileText, Sparkles, Loader2 } from "lucide-react";

const MindDashboard = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, total: 0, followups: 0 });

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data: rows } = await supabase
        .from("homeo_mind_cases")
        .select("id, patient_name, chief_complaint, suggested_remedy, status, created_at, detected_themes")
        .eq("doctor_user_id", uid)
        .order("created_at", { ascending: false })
        .limit(20);
      const list = rows ?? [];
      setCases(list);
      const { count: fcount } = await supabase
        .from("homeo_mind_followups")
        .select("id", { count: "exact", head: true })
        .eq("doctor_user_id", uid);
      setStats({
        active: list.filter((c) => c.status === "active").length,
        total: list.length,
        followups: fcount ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const tiles = [
    { to: "/homeo/mind/new", label: "New Case", icon: Plus, hint: "Narrative intake → AI themes" },
    { to: "/homeo/mind/cases", label: "Active Cases", icon: ListChecks, hint: `${stats.active} open` },
    { to: "/homeo/mind/followups", label: "Follow-ups", icon: CalendarCheck, hint: `${stats.followups} recorded` },
    { to: "/homeo/mind/reports", label: "Reports", icon: FileText, hint: "Theme & remedy patterns" },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className={t.label}>Perception-Based Case Analysis</p>
          <h1 className="font-display text-3xl font-semibold text-[hsl(45_85%_78%)] flex items-center gap-3">
            <Brain className="h-7 w-7" /> Ayuzee Mind Case AI
          </h1>
          <p className={`${t.mutedText} mt-1 text-sm`}>
            Identify the similimum through emotional themes — perception, not just symptoms.
          </p>
        </div>
        <Link to="/homeo/mind/new" className={t.primaryBtn}>
          <Sparkles className="h-4 w-4" /> Start New Case
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className={`${t.card} p-5 hover:border-[hsl(45_85%_55%/0.4)] transition group`}>
            <tile.icon className="h-6 w-6 text-[hsl(45_85%_60%)] mb-3 group-hover:scale-110 transition" />
            <p className="font-display text-lg font-semibold text-[hsl(45_85%_75%)]">{tile.label}</p>
            <p className={`${t.mutedText} text-xs mt-1`}>{tile.hint}</p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl text-[hsl(45_85%_75%)] mb-3">Recent Cases</h2>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(45_85%_60%)]" />
        ) : cases.length === 0 ? (
          <div className={`${t.card} p-8 text-center`}>
            <p className={t.mutedText}>No cases yet. <Link to="/homeo/mind/new" className="text-[hsl(45_85%_65%)] underline">Create your first case →</Link></p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {cases.map((c) => (
              <Link key={c.id} to={`/homeo/mind/cases/${c.id}`} className={`${t.card} p-4 hover:border-[hsl(45_85%_55%/0.4)] transition`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[hsl(45_85%_78%)] truncate">{c.patient_name || "Unnamed patient"}</p>
                    <p className={`${t.mutedText} text-xs truncate mt-0.5`}>{c.chief_complaint || "—"}</p>
                  </div>
                  {c.suggested_remedy && (
                    <span className={t.pill}>{c.suggested_remedy}</span>
                  )}
                </div>
                {c.detected_themes?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {c.detected_themes.slice(0, 4).map((th: string) => (
                      <span key={th} className="text-[10px] uppercase tracking-wider bg-[hsl(142_55%_30%/0.3)] text-[hsl(142_60%_75%)] px-2 py-0.5 rounded">
                        {th}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={`${t.card} p-4 text-xs ${t.mutedText} border-[hsl(45_85%_55%/0.25)]`}>
        <strong className="text-[hsl(45_85%_70%)]">Disclaimer:</strong> This software is educational clinical support only.
        Final prescription must be made by a qualified physician.
      </div>
    </div>
  );
};

export default MindDashboard;
