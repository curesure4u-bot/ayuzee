import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Repeat, Plus, Save, CheckCircle2, Crown, Star, Users, IndianRupee,
  TrendingUp, UserPlus, Calendar, Pause, Play, X,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  tier?: string | null;
  price: number;
  billing_cycle?: string | null;
  description?: string | null;
  features?: string[] | null;
  sessions_included?: number | null;
  is_active: boolean;
}

interface PatientSub {
  id: string;
  plan_name?: string | null;
  patient_name: string;
  phone?: string | null;
  price?: number | null;
  billing_cycle?: string | null;
  start_date?: string | null;
  next_billing_date?: string | null;
  status: string;
  sessions_used?: number | null;
}

const tierMeta: Record<string, { color: string; icon: any }> = {
  basic: { color: "text-slate-600", icon: Users },
  standard: { color: "text-blue-600", icon: Star },
  premium: { color: "text-purple-600", icon: Crown },
  vip: { color: "text-amber-600", icon: Crown },
};

const blankPlan = { name: "", tier: "standard", price: "", billing_cycle: "monthly", description: "", features: "", sessions_included: "" };
const blankAssign = { plan_id: "", patient_name: "", phone: "", notes: "" };

export default function SpineSubscriptions() {
  const [tab, setTab] = useState("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<PatientSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({ ...blankPlan });
  const [assign, setAssign] = useState({ ...blankAssign });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data: p } = await (supabase.from("spine_subscription_plans") as any)
        .select("*").order("display_order", { ascending: true });
      setPlans((p as Plan[]) || []);
      const { data: s } = await (supabase.from("spine_patient_subscriptions") as any)
        .select("*").order("created_at", { ascending: false });
      setSubs((s as PatientSub[]) || []);
    } catch { setPlans([]); setSubs([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const savePlan = async () => {
    if (!planForm.name || !planForm.price) { toast.error("Enter plan name and price"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_subscription_plans") as any).insert({
        owner_id: user?.id || null,
        name: planForm.name,
        tier: planForm.tier,
        price: Number(planForm.price),
        billing_cycle: planForm.billing_cycle,
        description: planForm.description || null,
        features: planForm.features ? planForm.features.split(",").map((s) => s.trim()).filter(Boolean) : [],
        sessions_included: planForm.sessions_included ? parseInt(planForm.sessions_included) : null,
        is_active: true,
      });
      if (error) { toast.error("Save failed: " + error.message); }
      else { toast.success("Plan created!"); setPlanForm({ ...blankPlan }); setShowPlanForm(false); load(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const nextBilling = (cycle?: string | null) => {
    const d = new Date();
    if (cycle === "quarterly") d.setMonth(d.getMonth() + 3);
    else if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  };

  const assignPlan = async () => {
    if (!assign.plan_id || !assign.patient_name) { toast.error("Select a plan and enter patient name"); return; }
    const plan = plans.find((p) => p.id === assign.plan_id);
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_patient_subscriptions") as any).insert({
        owner_id: user?.id || null,
        plan_id: plan?.id || null,
        plan_name: plan?.name || null,
        patient_name: assign.patient_name,
        phone: assign.phone || null,
        price: plan?.price ?? null,
        billing_cycle: plan?.billing_cycle || "monthly",
        start_date: new Date().toISOString().slice(0, 10),
        next_billing_date: nextBilling(plan?.billing_cycle),
        status: "active",
        notes: assign.notes || null,
      });
      if (error) { toast.error("Assign failed: " + error.message); }
      else { toast.success(`${plan?.name} assigned to ${assign.patient_name}`); setAssign({ ...blankAssign }); load(); setTab("members"); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const setStatus = async (s: PatientSub, status: string) => {
    try {
      await (supabase.from("spine_patient_subscriptions") as any).update({ status }).eq("id", s.id);
      load();
    } catch { toast.error("Update failed"); }
  };

  // MRR from active subs (normalize to monthly)
  const mrr = subs.filter((s) => s.status === "active").reduce((a, s) => {
    const p = s.price || 0;
    if (s.billing_cycle === "quarterly") return a + p / 3;
    if (s.billing_cycle === "yearly") return a + p / 12;
    return a + p;
  }, 0);
  const activeCount = subs.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Repeat className="h-6 w-6 text-indigo-600" /> Membership & Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Recurring revenue — predictable income from maintenance & wellness plans.</p>
        </div>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-indigo-600 flex items-center justify-center"><IndianRupee className="h-5 w-5" />{Math.round(mrr).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active Members</p>
        </CardContent></Card>
        <Card className="col-span-2 sm:col-span-1"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-purple-600 flex items-center justify-center"><IndianRupee className="h-5 w-5" />{Math.round(mrr * 12).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Projected Annual</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="plans" className="text-xs gap-1"><Star className="h-3 w-3" /> Plans</TabsTrigger>
          <TabsTrigger value="assign" className="text-xs gap-1"><UserPlus className="h-3 w-3" /> Assign</TabsTrigger>
          <TabsTrigger value="members" className="text-xs gap-1"><Users className="h-3 w-3" /> Members</TabsTrigger>
        </TabsList>

        {/* PLANS */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowPlanForm((v) => !v)} className="gap-1"><Plus className="h-4 w-4" /> New Plan</Button>
          </div>
          {showPlanForm && (
            <Card className="border-indigo-200">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Create Plan</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Plan Name</label><Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Maintenance Plan" /></div>
                  <div><label className="text-xs font-medium">Tier</label>
                    <Select value={planForm.tier} onValueChange={(v) => setPlanForm({ ...planForm, tier: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div><label className="text-xs font-medium">Price ₹</label><Input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} placeholder="2500" /></div>
                  <div><label className="text-xs font-medium">Billing</label>
                    <Select value={planForm.billing_cycle} onValueChange={(v) => setPlanForm({ ...planForm, billing_cycle: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs font-medium">Sessions/cycle</label><Input type="number" value={planForm.sessions_included} onChange={(e) => setPlanForm({ ...planForm, sessions_included: e.target.value })} placeholder="1" /></div>
                </div>
                <div><label className="text-xs font-medium">Description</label><Textarea value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} className="h-14" /></div>
                <div><label className="text-xs font-medium">Features (comma-separated)</label><Input value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} placeholder="1 session/month, WhatsApp coaching" /></div>
                <Button className="w-full gap-1" onClick={savePlan} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Create Plan"}</Button>
              </CardContent>
            </Card>
          )}

          {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {plans.map((p) => {
                const meta = tierMeta[p.tier || "standard"] || tierMeta.standard;
                const Icon = meta.icon;
                return (
                  <Card key={p.id} className={p.tier === "premium" || p.tier === "vip" ? "border-purple-200" : ""}>
                    <CardContent className="pt-4">
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                      <p className="font-semibold text-sm mt-1">{p.name}</p>
                      <p className="text-xl font-bold mt-1 flex items-center"><IndianRupee className="h-4 w-4" />{p.price}<span className="text-[11px] text-muted-foreground font-normal ml-1">/{(p.billing_cycle || "monthly").replace("ly", "")}</span></p>
                      {p.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                      <ul className="mt-2 space-y-0.5">
                        {(p.features || []).slice(0, 5).map((f, i) => (
                          <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-green-500 shrink-0 mt-0.5" /> {f}</li>
                        ))}
                      </ul>
                      <Button size="sm" variant="outline" className="w-full mt-3 gap-1" onClick={() => { setAssign({ ...assign, plan_id: p.id }); setTab("assign"); }}>
                        <UserPlus className="h-3.5 w-3.5" /> Assign
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ASSIGN */}
        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><UserPlus className="h-4 w-4" /> Assign Membership to Patient</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium">Plan</label>
                <Select value={assign.plan_id} onValueChange={(v) => setAssign({ ...assign, plan_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.price}/{(p.billing_cycle || "monthly").replace("ly", "")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-medium">Patient Name</label><Input value={assign.patient_name} onChange={(e) => setAssign({ ...assign, patient_name: e.target.value })} placeholder="Full name" /></div>
                <div><label className="text-xs font-medium">Phone</label><Input value={assign.phone} onChange={(e) => setAssign({ ...assign, phone: e.target.value })} placeholder="+91..." /></div>
              </div>
              <div><label className="text-xs font-medium">Notes</label><Textarea value={assign.notes} onChange={(e) => setAssign({ ...assign, notes: e.target.value })} className="h-14" placeholder="Any notes about this membership..." /></div>
              <Button className="w-full gap-1" onClick={assignPlan} disabled={saving}><CheckCircle2 className="h-4 w-4" /> {saving ? "Assigning..." : "Assign Membership"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEMBERS */}
        <TabsContent value="members" className="space-y-3">
          {loading ? <p className="text-sm text-muted-foreground text-center py-8">Loading...</p> :
            subs.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No members yet. Assign a plan to a patient to start recurring revenue.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {subs.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="py-3 flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-medium text-sm flex items-center gap-2">
                          {s.patient_name}
                          <Badge className={
                            s.status === "active" ? "bg-green-100 text-green-700 text-[9px]" :
                            s.status === "paused" ? "bg-amber-100 text-amber-700 text-[9px]" :
                            "bg-red-100 text-red-700 text-[9px]"
                          }>{s.status}</Badge>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.plan_name} · ₹{s.price}/{(s.billing_cycle || "monthly").replace("ly", "")}
                          {s.next_billing_date ? ` · next: ${new Date(s.next_billing_date).toLocaleDateString()}` : ""}
                          {s.phone ? ` · ${s.phone}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {s.status === "active" ? (
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-amber-600" onClick={() => setStatus(s, "paused")}><Pause className="h-3.5 w-3.5" /> Pause</Button>
                        ) : s.status === "paused" ? (
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-green-600" onClick={() => setStatus(s, "active")}><Play className="h-3.5 w-3.5" /> Resume</Button>
                        ) : null}
                        {s.status !== "cancelled" && (
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-red-600" onClick={() => setStatus(s, "cancelled")}><X className="h-3.5 w-3.5" /> Cancel</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
