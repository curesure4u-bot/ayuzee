import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

const YogaProgressTracker = () => {
  const { userId } = useDoctor();
  const [params] = useSearchParams();
  const presetPlan = params.get("plan") ?? "";

  const [plans, setPlans] = useState<any[]>([]);
  const [planId, setPlanId] = useState(presetPlan);
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    log_date: new Date().toISOString().slice(0, 10),
    pain_score: "", stress_score: "", sleep_score: "", energy_score: "",
    flexibility_score: "", weight_kg: "", practice_adherence_pct: "",
    before_notes: "", after_notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!userId) return;
    supabase.from("yoga_plans").select("id, plan_name, patient_name").eq("doctor_user_id", userId)
      .order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => {
        setPlans(data ?? []);
        if (!planId && data?.length) setPlanId(data[0].id);
      });
  }, [userId]);

  useEffect(() => {
    if (!planId) { setLogs([]); return; }
    supabase.from("yoga_progress_logs").select("*").eq("plan_id", planId).order("log_date", { ascending: true })
      .then(({ data }) => setLogs(data ?? []));
  }, [planId]);

  const chartData = useMemo(() =>
    logs.map((l) => ({
      date: l.log_date,
      pain: l.pain_score, stress: l.stress_score,
      sleep: l.sleep_score, energy: l.energy_score,
    })), [logs]);

  const handleSave = async () => {
    if (!userId || !planId) { toast.error("Pick a plan"); return; }
    setSaving(true);
    try {
      const num = (s: string) => (s === "" ? null : Number(s));
      const { error } = await supabase.from("yoga_progress_logs").insert([{
        doctor_user_id: userId,
        plan_id: planId,
        log_date: form.log_date,
        pain_score: num(form.pain_score),
        stress_score: num(form.stress_score),
        sleep_score: num(form.sleep_score),
        energy_score: num(form.energy_score),
        flexibility_score: num(form.flexibility_score),
        weight_kg: num(form.weight_kg),
        practice_adherence_pct: num(form.practice_adherence_pct),
        before_notes: form.before_notes || null,
        after_notes: form.after_notes || null,
      }]);
      if (error) throw error;
      toast.success("Progress logged");
      const { data } = await supabase.from("yoga_progress_logs").select("*").eq("plan_id", planId).order("log_date");
      setLogs(data ?? []);
      setForm({ ...form, before_notes: "", after_notes: "" });
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Plan</CardTitle>
          <div className="w-72">
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.patient_name} – {p.plan_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No logs yet. Add the first entry below.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pain" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  <Line type="monotone" dataKey="stress" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="sleep" stroke="hsl(var(--accent-foreground))" strokeWidth={2} />
                  <Line type="monotone" dataKey="energy" stroke="hsl(var(--ring))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Add progress log</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Field label="Date"><Input type="date" value={form.log_date} onChange={(e) => set("log_date", e.target.value)} /></Field>
          <Field label="Adherence (%)"><Input type="number" value={form.practice_adherence_pct} onChange={(e) => set("practice_adherence_pct", e.target.value)} /></Field>
          <Field label="Weight (kg)"><Input type="number" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} /></Field>
          <Field label="Flexibility 0–10"><Input type="number" value={form.flexibility_score} onChange={(e) => set("flexibility_score", e.target.value)} /></Field>
          <Field label="Pain 0–10"><Input type="number" value={form.pain_score} onChange={(e) => set("pain_score", e.target.value)} /></Field>
          <Field label="Stress 0–10"><Input type="number" value={form.stress_score} onChange={(e) => set("stress_score", e.target.value)} /></Field>
          <Field label="Sleep 0–10"><Input type="number" value={form.sleep_score} onChange={(e) => set("sleep_score", e.target.value)} /></Field>
          <Field label="Energy 0–10"><Input type="number" value={form.energy_score} onChange={(e) => set("energy_score", e.target.value)} /></Field>
          <Field label="Before notes" className="md:col-span-2"><Textarea rows={2} value={form.before_notes} onChange={(e) => set("before_notes", e.target.value)} /></Field>
          <Field label="After notes" className="md:col-span-2"><Textarea rows={2} value={form.after_notes} onChange={(e) => set("after_notes", e.target.value)} /></Field>
          <div className="md:col-span-4 flex justify-end">
            <Button onClick={handleSave} disabled={saving || !planId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save log
            </Button>
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">Recent logs</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-border text-sm">
              {[...logs].reverse().slice(0, 10).map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-2 py-2">
                  <Badge variant="outline">{l.log_date}</Badge>
                  {l.pain_score != null && <Badge variant="secondary">Pain {l.pain_score}</Badge>}
                  {l.stress_score != null && <Badge variant="secondary">Stress {l.stress_score}</Badge>}
                  {l.sleep_score != null && <Badge variant="secondary">Sleep {l.sleep_score}</Badge>}
                  {l.energy_score != null && <Badge variant="secondary">Energy {l.energy_score}</Badge>}
                  {l.practice_adherence_pct != null && <Badge>Adh {l.practice_adherence_pct}%</Badge>}
                  {l.after_notes && <span className="text-xs text-muted-foreground">· {l.after_notes}</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Field = ({ label, children, className = "" }: any) => (
  <div className={`space-y-1.5 ${className}`}><Label className="text-xs">{label}</Label>{children}</div>
);

export default YogaProgressTracker;
