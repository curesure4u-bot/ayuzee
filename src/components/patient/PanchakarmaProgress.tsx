import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from "recharts";
import { TrendingDown, Activity } from "lucide-react";

type SessionLite = {
  id: string;
  scheduled_date: string;
  status: string;
  stage: { stage_name: string; day_offset: number };
};

type Feedback = {
  session_id: string;
  symptom_severity: number | null;
  submitted_at: string;
};

function phaseFromName(name: string): "purva" | "pradhana" | "paschat" | "other" {
  const n = name.toLowerCase();
  if (n.includes("purva")) return "purva";
  if (n.includes("pradhana")) return "pradhana";
  if (n.includes("paschat") || n.includes("samsarjana")) return "paschat";
  return "other";
}
const PHASE_ORDER = ["purva", "pradhana", "paschat", "other"] as const;
const PHASE_LABEL: Record<string, string> = {
  purva: "Purva Karma",
  pradhana: "Pradhana Karma",
  paschat: "Paschat Karma",
  other: "Other",
};

export function PanchakarmaProgress({
  sessions,
  feedback,
}: {
  sessions: SessionLite[];
  feedback: Feedback[];
}) {
  const chartData = useMemo(() => {
    const fbMap = new Map(feedback.map(f => [f.session_id, f.symptom_severity]));
    return sessions
      .filter(s => fbMap.has(s.id) && fbMap.get(s.id) != null)
      .map(s => ({
        date: new Date(s.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        severity: fbMap.get(s.id) as number,
        stage: s.stage.stage_name,
      }));
  }, [sessions, feedback]);

  const totals = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === "completed").length;
    const pct = total ? Math.round((completed / total) * 100) : 0;

    const byPhase: Record<string, { total: number; completed: number }> = {};
    for (const s of sessions) {
      const p = phaseFromName(s.stage.stage_name);
      byPhase[p] = byPhase[p] ?? { total: 0, completed: 0 };
      byPhase[p].total += 1;
      if (s.status === "completed") byPhase[p].completed += 1;
    }
    const milestones = PHASE_ORDER.filter(p => byPhase[p]).map(p => {
      const { total, completed } = byPhase[p];
      let state: "not_started" | "in_progress" | "complete" = "not_started";
      if (completed === total) state = "complete";
      else if (completed > 0) state = "in_progress";
      return { phase: p, label: PHASE_LABEL[p], total, completed, state };
    });
    return { total, completed, pct, milestones };
  }, [sessions]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].severity;
    const last = chartData[chartData.length - 1].severity;
    return { first, last, delta: first - last };
  }, [chartData]);

  if (sessions.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Your progress
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Symptom severity you reported after each session (lower is better).
            </p>
          </div>
          {trend && (
            <Badge variant="secondary" className={trend.delta > 0 ? "bg-emerald-500/10 text-emerald-700" : "bg-muted"}>
              <TrendingDown className="mr-1 h-3 w-3" />
              {trend.delta > 0 ? `↓ ${trend.delta} points since start` : trend.delta < 0 ? `↑ ${Math.abs(trend.delta)} points` : "No change yet"}
            </Badge>
          )}
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="h-52 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={28} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                  formatter={(v: any) => [`${v} / 10`, "Severity"]}
                  labelFormatter={(l: any, p: any) => `${l}${p?.[0]?.payload?.stage ? " · " + p[0].payload.stage : ""}`}
                />
                <Line type="monotone" dataKey="severity" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-muted-foreground bg-muted/40 rounded-lg">
            Submit feedback after sessions to see your improvement trend here.
          </div>
        )}

        {/* Overall progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="font-medium">Course progress</span>
            <span className="text-muted-foreground">{totals.completed} / {totals.total} sessions · {totals.pct}%</span>
          </div>
          <Progress value={totals.pct} className="h-2" />
        </div>

        {/* Milestones per phase */}
        {totals.milestones.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-3">
            {totals.milestones.map(m => (
              <div key={m.phase} className="rounded-lg border border-border p-3">
                <div className="text-xs font-semibold">{m.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{m.completed} / {m.total} done</div>
                <Badge
                  variant="secondary"
                  className={`mt-2 ${
                    m.state === "complete"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : m.state === "in_progress"
                        ? "bg-amber-500/10 text-amber-700"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m.state === "complete" ? "Complete" : m.state === "in_progress" ? "In progress" : "Not started"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
