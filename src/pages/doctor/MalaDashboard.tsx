import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, AlertTriangle, CalendarCheck } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";
import { STOOL_TYPES, RISK_LABEL } from "@/data/ashtavidha";

type Row = {
  id: string;
  assessment_date: string;
  stool_type: number;
  dosha: string | null;
  agni: string | null;
  ama: string | null;
  risk_level: string | null;
  followup_date: string | null;
  patient_name: string | null;
};

const DOSHA_COLORS: Record<string, string> = {
  Vata: "#6366f1", Pitta: "#ef4444", Kapha: "#10b981",
  "Pitta-Kapha": "#f59e0b", Mixed: "#a855f7", Balanced: "#22c55e",
};

const MalaDashboard = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("mala_pareeksha_assessments")
        .select("id,assessment_date,stool_type,dosha,agni,ama,risk_level,followup_date,patient_name")
        .order("assessment_date", { ascending: false })
        .limit(500);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = rows.filter((r) => r.assessment_date === today).length;
    const normal = rows.filter((r) => r.risk_level === "normal").length;
    const urgent = rows.filter((r) => r.risk_level === "urgent").length;
    const followUpDue = rows.filter((r) => r.followup_date && r.followup_date <= today).length;
    const doshaCount: Record<string, number> = {};
    rows.forEach((r) => {
      const d = r.dosha ?? "Unknown";
      doshaCount[d] = (doshaCount[d] ?? 0) + 1;
    });
    const doshaPie = Object.entries(doshaCount).map(([name, value]) => ({ name, value }));
    return { total: rows.length, todayCount, normal, urgent, followUpDue, doshaPie };
  }, [rows]);

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/doctor/ashtavidha/mala" className="inline-flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Mala Pareeksha
        </Link>
        <span>/</span>
        <span className="text-foreground">Dashboard</span>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Clinical Analytics</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[hsl(150,45%,18%)]">Mala Pareeksha Dashboard</h1>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<Activity className="h-5 w-5" />} label="Total assessments" value={stats.total} />
            <Stat icon={<CalendarCheck className="h-5 w-5" />} label="Today" value={stats.todayCount} />
            <Stat icon={<Activity className="h-5 w-5 text-emerald-600" />} label="Normal" value={stats.normal} />
            <Stat icon={<AlertTriangle className="h-5 w-5 text-red-600" />} label="Urgent" value={stats.urgent} tone="danger" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Vata", "Pitta", "Kapha", "Mixed"].map((d) => (
              <Stat
                key={d}
                icon={<span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: DOSHA_COLORS[d] }} />}
                label={d}
                value={rows.filter((r) => r.dosha === d).length}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 font-display text-lg font-semibold">Dosha distribution</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={stats.doshaPie} dataKey="value" nameKey="name" outerRadius={90} label>
                        {stats.doshaPie.map((e) => (
                          <Cell key={e.name} fill={DOSHA_COLORS[e.name] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center justify-between font-display text-lg font-semibold">
                  Follow-ups due
                  <Badge variant="outline">{stats.followUpDue}</Badge>
                </h3>
                <div className="space-y-2">
                  {rows.filter((r) => r.followup_date && r.followup_date <= new Date().toISOString().slice(0, 10)).slice(0, 8).map((r) => {
                    const st = STOOL_TYPES.find((s) => s.id === r.stool_type);
                    return (
                      <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                        <div>
                          <div className="font-semibold">{r.patient_name || "Unnamed"}</div>
                          <div className="text-xs text-muted-foreground">Due {r.followup_date} · {st?.name}</div>
                        </div>
                        <Badge variant="outline">{r.dosha ?? "—"}</Badge>
                      </div>
                    );
                  })}
                  {stats.followUpDue === 0 && <p className="text-sm text-muted-foreground">No follow-ups due.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Link to="/doctor/ashtavidha/mala">
              <Button>Open Mala Pareeksha</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

const Stat = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone?: "danger" }) => (
  <Card className={tone === "danger" ? "border-red-200 bg-red-50/40" : ""}>
    <CardContent className="flex items-center gap-3 p-4">
      <div className="rounded-md bg-muted/60 p-2">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </CardContent>
  </Card>
);

export default MalaDashboard;
