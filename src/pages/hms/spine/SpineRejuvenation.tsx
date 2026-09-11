import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Leaf, Sparkles, Repeat, IndianRupee, CheckCircle2, ArrowRight, Send,
  GraduationCap, Gauge, CalendarClock, Heart, Flower2,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  tier?: string | null;
  price: number;
  billing_cycle?: string | null;
  description?: string | null;
  features?: string[] | null;
}

// The 4-step rejuvenation journey (Rasayana framing)
const journey = [
  { icon: GraduationCap, title: "Graduation", desc: "Patient recovers from pain — celebrate the win and reframe: now protect the gains." },
  { icon: Gauge, title: "Wellness Age Baseline", desc: "Measure biological vs chronological age — the number they'll want to improve." },
  { icon: Flower2, title: "Rasayana Program", desc: "Quarterly rejuvenation (Panchakarma + Rasayana herbs) to reverse the wellness age." },
  { icon: Repeat, title: "Retest & Retain", desc: "Re-measure each quarter — visible progress keeps them subscribed for years." },
];

const rasayanaPillars = [
  { icon: Leaf, title: "Rasayana Herbs", desc: "Ashwagandha, Amalaki, Guduchi — classical anti-degenerative rejuvenatives." },
  { icon: Sparkles, title: "Seasonal Detox (Ritucharya)", desc: "Panchakarma-based seasonal cleansing to reset the body." },
  { icon: Heart, title: "Ojas & Vitality", desc: "Diet, sleep and lifestyle to build Ojas — the essence of immunity & vigor." },
  { icon: CalendarClock, title: "Consistency", desc: "Quarterly cadence sustains results — longevity is a practice, not an event." },
];

export default function SpineRejuvenation() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [enroll, setEnroll] = useState({ patient_name: "", phone: "", plan_id: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await (supabase.from("spine_subscription_plans") as any)
          .select("*").in("tier", ["premium", "vip"]).order("price", { ascending: true });
        // prefer rejuvenation-named plans, else any premium/vip
        setPlans((data as Plan[]) || []);
      } catch { setPlans([]); }
    })();
  }, []);

  const rejuvPlans = plans.filter((p) => /rasayana|longevity|rejuven/i.test(p.name)).concat(
    plans.filter((p) => !/rasayana|longevity|rejuven/i.test(p.name))
  ).slice(0, 3);

  const enrollPatient = async (plan: Plan) => {
    if (!enroll.patient_name) { toast.error("Enter patient name first (top of Enroll card)"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const nb = new Date();
      if (plan.billing_cycle === "yearly") nb.setFullYear(nb.getFullYear() + 1);
      else if (plan.billing_cycle === "quarterly") nb.setMonth(nb.getMonth() + 3);
      else nb.setMonth(nb.getMonth() + 1);
      const { error } = await (supabase.from("spine_patient_subscriptions") as any).insert({
        owner_id: user?.id || null, plan_id: plan.id, plan_name: plan.name,
        patient_name: enroll.patient_name, phone: enroll.phone || null, price: plan.price,
        billing_cycle: plan.billing_cycle || "quarterly", start_date: new Date().toISOString().slice(0, 10),
        next_billing_date: nb.toISOString().slice(0, 10), status: "active", notes: "Enrolled via Rejuvenation graduation",
      });
      if (error) toast.error("Enroll failed: " + error.message);
      else { toast.success(`${enroll.patient_name} enrolled in ${plan.name}!`); setEnroll({ patient_name: "", phone: "", plan_id: "" }); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Flower2 className="h-6 w-6 text-green-600" /> Rejuvenation & Rasayana Program</h1>
          <p className="text-muted-foreground mt-1">Turn recovered patients into lifelong wellness members — from pain-free to age-defying.</p>
        </div>
        <Badge className="bg-green-100 text-green-700"><Leaf className="h-3 w-3 mr-1" /> Longevity</Badge>
      </div>

      {/* Why banner */}
      <Card className="border-green-200 bg-green-50/40">
        <CardContent className="pt-4 text-sm text-muted-foreground flex gap-3">
          <Sparkles className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-foreground">The retention insight</p>
            <p className="mt-1">Most patients stop coming once pain is relieved. This program reframes recovery as the <b>start</b> of a longevity journey — with a measurable Wellness Age they'll want to keep improving through quarterly Rasayana rejuvenation. Recurring revenue + healthier patients.</p>
          </div>
        </CardContent>
      </Card>

      {/* The graduation journey */}
      <div>
        <h2 className="text-sm font-semibold mb-2">The Graduation Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {journey.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="relative">
                <CardContent className="pt-4">
                  <div className="w-9 h-9 rounded-full bg-green-100 grid place-items-center"><Icon className="h-4 w-4 text-green-600" /></div>
                  <p className="font-semibold text-sm mt-2">{i + 1}. {s.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.desc}</p>
                </CardContent>
                {i < journey.length - 1 && <ArrowRight className="hidden md:block h-4 w-4 text-green-300 absolute -right-2.5 top-1/2 -translate-y-1/2 z-10" />}
              </Card>
            );
          })}
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate("/hms/spine-wellness-age")}><Gauge className="h-4 w-4" /> Open Wellness Age Tracker</Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate("/hms/spine-retreats")}><CalendarClock className="h-4 w-4" /> View Retreats</Button>
        </div>
      </div>

      {/* Rasayana pillars */}
      <div>
        <h2 className="text-sm font-semibold mb-2">What Rasayana Delivers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rasayanaPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <Card key={i}><CardContent className="pt-4">
                <Icon className="h-5 w-5 text-green-600" />
                <p className="font-medium text-sm mt-1">{p.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{p.desc}</p>
              </CardContent></Card>
            );
          })}
        </div>
      </div>

      {/* Enroll into rejuvenation plan */}
      <Card className="border-green-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Send className="h-4 w-4" /> Enroll a Graduated Patient</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-medium">Patient Name</label><Input value={enroll.patient_name} onChange={(e) => setEnroll({ ...enroll, patient_name: e.target.value })} placeholder="Recovered patient" /></div>
            <div><label className="text-xs font-medium">Phone</label><Input value={enroll.phone} onChange={(e) => setEnroll({ ...enroll, phone: e.target.value })} placeholder="+91..." /></div>
          </div>
          {rejuvPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No rejuvenation plans found. Add them in Memberships & Subscriptions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {rejuvPlans.map((p) => (
                <Card key={p.id} className={p.tier === "vip" ? "border-amber-300" : "border-green-200"}>
                  <CardContent className="pt-4">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xl font-bold mt-1 flex items-center"><IndianRupee className="h-4 w-4" />{p.price}<span className="text-[11px] text-muted-foreground font-normal ml-1">/{(p.billing_cycle || "quarterly").replace("ly", "")}</span></p>
                    {p.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                    <ul className="mt-2 space-y-0.5">
                      {(p.features || []).slice(0, 4).map((f, i) => <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-green-500 shrink-0 mt-0.5" /> {f}</li>)}
                    </ul>
                    <Button size="sm" className="w-full mt-3 gap-1" onClick={() => enrollPatient(p)} disabled={saving}><CheckCircle2 className="h-3.5 w-3.5" /> Enroll</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
