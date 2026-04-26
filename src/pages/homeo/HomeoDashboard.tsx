import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { homeoTokens as t } from "./lib/ui";
import { Users, ClipboardList, Search, BookOpen, CalendarCheck, FileText, UserPlus, TrendingUp, Pill } from "lucide-react";

const HomeoDashboard = () => {
  const [stats, setStats] = useState({ patients: 0, cases: 0, prescriptions: 0, followups: 0, remedies: 0, symptoms: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, c, rx, fu, rm, sy, recentCases] = await Promise.all([
        supabase.from("homeo_patients").select("id", { count: "exact", head: true }),
        supabase.from("homeo_cases").select("id", { count: "exact", head: true }),
        supabase.from("homeo_prescriptions").select("id", { count: "exact", head: true }),
        supabase.from("homeo_followups").select("id", { count: "exact", head: true }),
        supabase.from("homeo_remedies").select("id", { count: "exact", head: true }),
        supabase.from("homeo_symptoms").select("id", { count: "exact", head: true }),
        supabase
          .from("homeo_cases")
          .select("id, case_date, status, patient:homeo_patients(full_name, age, gender)")
          .order("case_date", { ascending: false })
          .limit(6),
      ]);
      setStats({
        patients: p.count ?? 0,
        cases: c.count ?? 0,
        prescriptions: rx.count ?? 0,
        followups: fu.count ?? 0,
        remedies: rm.count ?? 0,
        symptoms: sy.count ?? 0,
      });
      setRecent(recentCases.data ?? []);
    };
    load();
  }, []);

  const tiles = [
    { to: "/homeo/patients/new", label: "New Patient", icon: UserPlus, hint: "Start a fresh case" },
    { to: "/homeo/case-taking", label: "Case Taking", icon: ClipboardList, hint: "Full Hahnemannian protocol" },
    { to: "/homeo/repertory", label: "Repertory", icon: Search, hint: "Rank remedies by symptoms" },
    { to: "/homeo/materia-medica", label: "Materia Medica", icon: BookOpen, hint: "AI symptom search" },
    { to: "/homeo/follow-up", label: "Follow Up", icon: CalendarCheck, hint: "Track progress" },
    { to: "/homeo/reports", label: "Reports", icon: FileText, hint: "PDF exports" },
  ];

  const stat = (label: string, value: number, icon: any, accent: string) => {
    const Icon = icon;
    return (
      <div className={`${t.card} flex items-center gap-4 p-5`}>
        <span className={`grid h-12 w-12 place-items-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5 text-[hsl(160_30%_4%)]" />
        </span>
        <div>
          <p className={`${t.label}`}>{label}</p>
          <p className="font-display text-2xl font-semibold text-[hsl(45_85%_75%)]">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <p className={t.label}>Overview</p>
        <h2 className="font-display text-3xl font-semibold text-[hsl(45_85%_78%)]">Welcome back, Doctor.</h2>
        <p className={`mt-1 ${t.mutedText}`}>Your premium homeopathy practice — case taking, repertory, materia medica.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stat("Patients", stats.patients, Users, "bg-[hsl(45_85%_60%)]")}
        {stat("Cases", stats.cases, ClipboardList, "bg-[hsl(142_55%_50%)]")}
        {stat("Prescriptions", stats.prescriptions, Pill, "bg-[hsl(45_85%_60%)]")}
        {stat("Follow-ups", stats.followups, CalendarCheck, "bg-[hsl(142_55%_50%)]")}
        {stat("Remedies", stats.remedies, BookOpen, "bg-[hsl(45_85%_60%)]")}
        {stat("Rubrics", stats.symptoms, Search, "bg-[hsl(142_55%_50%)]")}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className={`${t.card} group p-5 transition hover:border-[hsl(45_85%_55%/0.5)]`}>
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-[hsl(142_55%_30%)] to-[hsl(45_85%_55%)]">
                <tile.icon className="h-5 w-5 text-[hsl(160_30%_4%)]" />
              </span>
              <TrendingUp className="h-4 w-4 text-[hsl(45_85%_55%/0.5)] transition group-hover:text-[hsl(45_85%_75%)]" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-[hsl(45_85%_75%)]">{tile.label}</p>
            <p className={`mt-1 text-sm ${t.mutedText}`}>{tile.hint}</p>
          </Link>
        ))}
      </div>

      <div className={`${t.card} p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-[hsl(45_85%_75%)]">Recent Cases</h3>
          <Link to="/homeo/case-taking" className="text-sm text-[hsl(45_85%_60%)] hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className={`${t.mutedText} text-sm`}>No cases yet. <Link to="/homeo/patients/new" className="text-[hsl(45_85%_60%)] underline">Add your first patient</Link>.</p>
        ) : (
          <ul className="divide-y divide-[hsl(45_40%_55%/0.12)]">
            {recent.map((c: any) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[hsl(45_30%_94%)]">{c.patient?.full_name ?? "Unknown patient"}</p>
                  <p className={`text-xs ${t.mutedText}`}>{c.patient?.age ?? "?"} y · {c.patient?.gender ?? "—"} · {new Date(c.case_date).toLocaleDateString()}</p>
                </div>
                <Link to={`/homeo/case-taking?case=${c.id}`} className={t.pill}>Open</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomeoDashboard;
