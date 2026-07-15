import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Run in Supabase: CREATE TABLE IF NOT EXISTS patient_vitals (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id), recorded_date date DEFAULT CURRENT_DATE,
//   weight_kg numeric, height_cm numeric, bp_systolic int, bp_diastolic int, pulse int, blood_sugar_fasting numeric,
//   spo2 numeric, temperature numeric, notes text, created_at timestamptz DEFAULT now()
// );

type Vital = { id: string; recorded_date: string; weight_kg: number | null; bp_systolic: number | null; bp_diastolic: number | null; pulse: number | null; blood_sugar_fasting: number | null; spo2: number | null; temperature: number | null };

const tone = (status: "green" | "amber" | "red") => status === "green" ? "border-primary/20 bg-primary/10 text-primary" : status === "amber" ? "border-warning/20 bg-warning/10 text-warning" : "border-destructive/20 bg-destructive/10 text-destructive";
const toNumber = (value: string) => value ? Number(value) : null;

export const VitalsTracker = ({ userId }: { userId: string }) => {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [comingSoon, setComingSoon] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ weight_kg: "", bp_systolic: "", bp_diastolic: "", pulse: "", blood_sugar_fasting: "", spo2: "", temperature: "" });

  const loadVitals = () => {
    supabase.from("patient_vitals").select("id, recorded_date, weight_kg, bp_systolic, bp_diastolic, pulse, blood_sugar_fasting, spo2, temperature").eq("user_id", userId).order("recorded_date", { ascending: false }).limit(7)
      .then(({ data, error }) => { if (error) setComingSoon(true); else setVitals((data ?? []) as Vital[]); setLoading(false); });
  };

  useEffect(loadVitals, [userId]);

  const latest = vitals[0];
  const chartData = useMemo(() => [...vitals].reverse().map((v) => ({ date: v.recorded_date, weight: Number(v.weight_kg ?? 0) })), [vitals]);
  const save = async () => {
    const { error } = await supabase.from("patient_vitals").insert({ user_id: userId, weight_kg: toNumber(form.weight_kg), bp_systolic: toNumber(form.bp_systolic), bp_diastolic: toNumber(form.bp_diastolic), pulse: toNumber(form.pulse), blood_sugar_fasting: toNumber(form.blood_sugar_fasting), spo2: toNumber(form.spo2), temperature: toNumber(form.temperature) });
    if (error) return toast.error(error.message);
    toast.success("Vitals saved! ✓");
    setOpen(false);
    setForm({ weight_kg: "", bp_systolic: "", bp_diastolic: "", pulse: "", blood_sugar_fasting: "", spo2: "", temperature: "" });
    loadVitals();
  };

  if (comingSoon) return <article className="rounded-2xl border border-border bg-card p-6"><h2 className="font-display text-xl">📊 My Vitals</h2><p className="mt-2 text-sm text-muted-foreground">Vitals tracking is coming soon.</p></article>;

  const bpStatus = latest?.bp_systolic && latest?.bp_diastolic ? latest.bp_systolic < 120 && latest.bp_diastolic < 80 ? "green" : latest.bp_systolic < 140 && latest.bp_diastolic < 90 ? "amber" : "red" : "amber";
  const pulseStatus = latest?.pulse && latest.pulse >= 60 && latest.pulse <= 100 ? "green" : "amber";
  const sugarStatus = latest?.blood_sugar_fasting ? latest.blood_sugar_fasting < 100 ? "green" : latest.blood_sugar_fasting < 126 ? "amber" : "red" : "amber";

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4"><h2 className="font-display text-xl">📊 My Vitals</h2><Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>Log Today</Button></div>
      {loading ? <p className="mt-6 text-sm text-muted-foreground">Loading vitals…</p> : vitals.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center"><p className="text-muted-foreground">Track your vitals to see your health trends</p><Button variant="hero" className="mt-4" onClick={() => setOpen(true)}>Log First Reading</Button></div> : <><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className={`rounded-xl border p-3 ${tone(bpStatus)}`}><p className="font-semibold">🫀 {latest?.bp_systolic ?? "--"}/{latest?.bp_diastolic ?? "--"}</p><p className="text-xs opacity-80">Blood Pressure</p></div><div className={`rounded-xl border p-3 ${tone(pulseStatus)}`}><p className="font-semibold">💓 {latest?.pulse ?? "--"} bpm</p><p className="text-xs opacity-80">Pulse</p></div><div className={`rounded-xl border p-3 ${tone(sugarStatus)}`}><p className="font-semibold">🩸 {latest?.blood_sugar_fasting ?? "--"} mg/dL</p><p className="text-xs opacity-80">Sugar</p></div><div className="rounded-xl border border-border bg-muted/40 p-3"><p className="font-semibold">⚖️ {latest?.weight_kg ?? "--"} kg</p><p className="text-xs text-muted-foreground">Weight</p></div></div><div className="mt-5 h-[120px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div></>}
      {open && <div className="mt-5 grid gap-3 rounded-xl border border-border bg-background/60 p-4 sm:grid-cols-2"><Input placeholder="Weight (kg)" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /><div className="grid grid-cols-2 gap-2"><Input placeholder="BP Systolic" value={form.bp_systolic} onChange={(e) => setForm({ ...form, bp_systolic: e.target.value })} /><Input placeholder="Diastolic" value={form.bp_diastolic} onChange={(e) => setForm({ ...form, bp_diastolic: e.target.value })} /></div><Input placeholder="Pulse" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} /><Input placeholder="Blood Sugar" value={form.blood_sugar_fasting} onChange={(e) => setForm({ ...form, blood_sugar_fasting: e.target.value })} /><Input placeholder="SpO2" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} /><Input placeholder="Temperature" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} /><Button variant="hero" className="sm:col-span-2" onClick={save}>Save</Button></div>}
    </article>
  );
};