import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Sparkles, Loader2, Calendar as CalIcon, ListChecks, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  patient_name: string;
  patient_age: number | null;
  patient_gender: string | null;
  indication: string;
  prakriti: string | null;
  vikriti: string | null;
  primary_procedure: string | null;
  total_days: number;
  start_date: string;
  status: string;
  ai_recommendation: any;
  notes: string | null;
};

type Day = {
  id: string;
  plan_id: string;
  day_number: number;
  scheduled_date: string | null;
  phase: string;
  procedure: string;
  medicines: string | null;
  diet: string | null;
  duration_minutes: number | null;
  notes: string | null;
  completed: boolean;
};

const PROCEDURES = ["Vamana", "Virechana", "Basti", "Nasya", "Raktamokshana"];

const phaseColor: Record<string, string> = {
  purvakarma: "bg-blue-500/10 text-blue-700 border-blue-200",
  pradhanakarma: "bg-amber-500/10 text-amber-700 border-amber-200",
  paschatkarma: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

export default function Panchakarma() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // create form
  const [form, setForm] = useState({
    patient_name: "", patient_age: "", patient_gender: "",
    indication: "", prakriti: "", vikriti: "", primary_procedure: "",
    total_days: "14", start_date: new Date().toISOString().slice(0, 10), notes: "",
  });

  useEffect(() => { loadPlans(); }, []);
  useEffect(() => { if (selected) loadDays(selected.id); }, [selected]);

  const loadPlans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vaidya_panchakarma_plans")
      .select("*")
      .order("start_date", { ascending: false });
    setPlans((data as Plan[]) || []);
    setLoading(false);
  };

  const loadDays = async (planId: string) => {
    const { data } = await supabase
      .from("vaidya_panchakarma_days")
      .select("*")
      .eq("plan_id", planId)
      .order("day_number");
    setDays((data as Day[]) || []);
  };

  const createPlan = async () => {
    if (!form.patient_name.trim() || !form.indication.trim()) {
      toast.error("Patient name and indication are required"); return;
    }
    setCreating(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("vaidya_panchakarma_plans").insert({
      doctor_user_id: u.user!.id,
      patient_name: form.patient_name,
      patient_age: form.patient_age ? Number(form.patient_age) : null,
      patient_gender: form.patient_gender || null,
      indication: form.indication,
      prakriti: form.prakriti || null,
      vikriti: form.vikriti || null,
      primary_procedure: form.primary_procedure || null,
      total_days: Number(form.total_days) || 14,
      start_date: form.start_date,
      notes: form.notes || null,
    }).select().single();
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Plan created");
    setOpen(false);
    setForm({ patient_name: "", patient_age: "", patient_gender: "", indication: "", prakriti: "", vikriti: "", primary_procedure: "", total_days: "14", start_date: new Date().toISOString().slice(0, 10), notes: "" });
    await loadPlans();
    setSelected(data as Plan);
  };

  const generateAi = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-panchakarma-plan", {
        body: {
          indication: selected.indication,
          prakriti: selected.prakriti,
          vikriti: selected.vikriti,
          primary_procedure: selected.primary_procedure,
          total_days: selected.total_days,
          patient_age: selected.patient_age,
          patient_gender: selected.patient_gender,
          notes: selected.notes,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const plan = (data as any).plan;

      // Save AI recommendation
      await supabase.from("vaidya_panchakarma_plans")
        .update({ ai_recommendation: plan }).eq("id", selected.id);

      // Generate days (replace existing)
      await supabase.from("vaidya_panchakarma_days").delete().eq("plan_id", selected.id);
      const start = new Date(selected.start_date);
      const rows = (plan.days || []).map((d: any) => {
        const dt = new Date(start);
        dt.setDate(start.getDate() + (d.day_number - 1));
        return {
          plan_id: selected.id,
          day_number: d.day_number,
          scheduled_date: dt.toISOString().slice(0, 10),
          phase: d.phase,
          procedure: d.procedure,
          medicines: d.medicines || null,
          diet: d.diet || null,
          duration_minutes: d.duration_minutes || null,
          notes: d.notes || null,
        };
      });
      if (rows.length) await supabase.from("vaidya_panchakarma_days").insert(rows);

      toast.success("AI plan generated");
      setSelected({ ...selected, ai_recommendation: plan });
      loadDays(selected.id);
    } catch (e: any) {
      toast.error(e.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleDay = async (d: Day) => {
    const { error } = await supabase.from("vaidya_panchakarma_days")
      .update({ completed: !d.completed, completed_at: !d.completed ? new Date().toISOString() : null })
      .eq("id", d.id);
    if (error) { toast.error(error.message); return; }
    loadDays(d.plan_id);
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan and all its days?")) return;
    await supabase.from("vaidya_panchakarma_plans").delete().eq("id", id);
    setSelected(null); setDays([]); loadPlans();
  };

  const setStatus = async (status: string) => {
    if (!selected) return;
    await supabase.from("vaidya_panchakarma_plans").update({ status }).eq("id", selected.id);
    setSelected({ ...selected, status }); loadPlans();
  };

  const completedCount = days.filter(d => d.completed).length;
  const progressPct = days.length ? Math.round((completedCount / days.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">Panchakarma Planner</h1>
          <p className="text-sm text-muted-foreground">Day-wise Purvakarma → Pradhanakarma → Paschatkarma protocols with AI assist</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="mr-2 h-4 w-4" /> New Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New Panchakarma Plan</DialogTitle></DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2"><Label>Patient name *</Label><Input value={form.patient_name} onChange={e=>setForm(f=>({...f, patient_name: e.target.value}))} /></div>
              <div><Label>Age</Label><Input type="number" value={form.patient_age} onChange={e=>setForm(f=>({...f, patient_age: e.target.value}))} /></div>
              <div>
                <Label>Gender</Label>
                <Select value={form.patient_gender} onValueChange={v=>setForm(f=>({...f, patient_gender: v}))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Label>Indication / Disease *</Label><Input placeholder="e.g. Chronic Arthritis, Obesity, Skin disease" value={form.indication} onChange={e=>setForm(f=>({...f, indication: e.target.value}))} /></div>
              <div><Label>Prakriti</Label><Input placeholder="Vata-Pitta etc." value={form.prakriti} onChange={e=>setForm(f=>({...f, prakriti: e.target.value}))} /></div>
              <div><Label>Vikriti</Label><Input placeholder="Current imbalance" value={form.vikriti} onChange={e=>setForm(f=>({...f, vikriti: e.target.value}))} /></div>
              <div>
                <Label>Primary procedure</Label>
                <Select value={form.primary_procedure} onValueChange={v=>setForm(f=>({...f, primary_procedure: v}))}>
                  <SelectTrigger><SelectValue placeholder="Doctor's discretion" /></SelectTrigger>
                  <SelectContent>{PROCEDURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Total days</Label><Input type="number" value={form.total_days} onChange={e=>setForm(f=>({...f, total_days: e.target.value}))} /></div>
              <div className="md:col-span-2"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f, start_date: e.target.value}))} /></div>
              <div className="md:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e=>setForm(f=>({...f, notes: e.target.value}))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button onClick={createPlan} disabled={creating}>{creating ? "Creating…" : "Create Plan"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* Plans list */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Plans ({plans.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : plans.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No plans yet</div>
            ) : (
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {plans.map(p => (
                  <button key={p.id} onClick={()=>setSelected(p)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition ${selected?.id === p.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                    <div className="font-semibold text-sm">{p.patient_name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.indication}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{p.total_days}d · {new Date(p.start_date).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan detail */}
        <div className="space-y-4">
          {!selected ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">
              <CalIcon className="mx-auto h-10 w-10 mb-3 opacity-40" />
              Select a plan or create a new one to begin
            </CardContent></Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle>{selected.patient_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{selected.indication}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        {selected.prakriti && <Badge variant="secondary">Prakriti: {selected.prakriti}</Badge>}
                        {selected.vikriti && <Badge variant="secondary">Vikriti: {selected.vikriti}</Badge>}
                        {selected.primary_procedure && <Badge>{selected.primary_procedure}</Badge>}
                        <span className="text-muted-foreground">{selected.total_days} days · starts {new Date(selected.start_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Select value={selected.status} onValueChange={setStatus}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["planned","active","completed","cancelled"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" onClick={()=>deletePlan(selected.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">{completedCount} / {days.length} days · {progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <Button onClick={generateAi} disabled={aiLoading} className="mt-4" variant="hero">
                    {aiLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-2 h-4 w-4" /> {days.length ? "Regenerate" : "Generate"} AI Day-wise Plan</>}
                  </Button>
                </CardContent>
              </Card>

              {selected.ai_recommendation && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI Recommendation</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {selected.ai_recommendation.summary && <p>{selected.ai_recommendation.summary}</p>}
                    {selected.ai_recommendation.precautions?.length > 0 && (
                      <div>
                        <div className="font-semibold mb-1">Precautions</div>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {selected.ai_recommendation.precautions.map((p: string, i: number) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                    {selected.ai_recommendation.expected_outcomes?.length > 0 && (
                      <div>
                        <div className="font-semibold mb-1">Expected outcomes</div>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {selected.ai_recommendation.expected_outcomes.map((p: string, i: number) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all"><ListChecks className="mr-1 h-4 w-4" /> All Days</TabsTrigger>
                  <TabsTrigger value="purvakarma">Purvakarma</TabsTrigger>
                  <TabsTrigger value="pradhanakarma">Pradhanakarma</TabsTrigger>
                  <TabsTrigger value="paschatkarma">Paschatkarma</TabsTrigger>
                </TabsList>
                {(["all","purvakarma","pradhanakarma","paschatkarma"] as const).map(tab => (
                  <TabsContent key={tab} value={tab} className="space-y-2">
                    {days.length === 0 ? (
                      <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No days yet — generate an AI plan above.</CardContent></Card>
                    ) : (
                      days.filter(d => tab === "all" || d.phase === tab).map(d => (
                        <Card key={d.id} className={d.completed ? "opacity-70" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox checked={d.completed} onCheckedChange={() => toggleDay(d)} className="mt-1" />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-semibold">Day {d.day_number}</span>
                                  <Badge variant="outline" className={phaseColor[d.phase] || ""}>{d.phase}</Badge>
                                  <span className="text-xs text-muted-foreground">{d.scheduled_date && new Date(d.scheduled_date).toLocaleDateString()}</span>
                                  {d.duration_minutes ? <span className="text-xs text-muted-foreground">· {d.duration_minutes} min</span> : null}
                                </div>
                                <div className="font-medium text-sm">{d.procedure}</div>
                                {d.medicines && <div className="text-xs mt-1"><span className="font-semibold">Medicines:</span> {d.medicines}</div>}
                                {d.diet && <div className="text-xs mt-1"><span className="font-semibold">Diet:</span> {d.diet}</div>}
                                {d.notes && <div className="text-xs text-muted-foreground mt-1">{d.notes}</div>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
