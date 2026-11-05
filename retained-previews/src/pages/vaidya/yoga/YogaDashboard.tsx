import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flower2, ClipboardPlus, ListChecks, Library, Activity, Users, Sparkles, ArrowRight,
} from "lucide-react";

const YogaDashboard = () => {
  const { userId } = useDoctor();
  const [stats, setStats] = useState({
    plans: 0, activePlans: 0, assessments: 0, protocols: 0, asanas: 0, logs7: 0,
  });
  const [recentPlans, setRecentPlans] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const [plans, active, assess, protocols, asanas, logs, recent] = await Promise.all([
        supabase.from("yoga_plans").select("id", { count: "exact", head: true }).eq("doctor_user_id", userId),
        supabase.from("yoga_plans").select("id", { count: "exact", head: true }).eq("doctor_user_id", userId).eq("status", "active"),
        supabase.from("yoga_assessments").select("id", { count: "exact", head: true }).eq("doctor_user_id", userId),
        supabase.from("yoga_condition_protocols").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("yoga_asanas").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("yoga_progress_logs").select("id", { count: "exact", head: true }).eq("doctor_user_id", userId).gte("created_at", since),
        supabase.from("yoga_plans").select("id, plan_name, patient_name, condition_name, status, created_at").eq("doctor_user_id", userId).order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        plans: plans.count ?? 0,
        activePlans: active.count ?? 0,
        assessments: assess.count ?? 0,
        protocols: protocols.count ?? 0,
        asanas: asanas.count ?? 0,
        logs7: logs.count ?? 0,
      });
      setRecentPlans(recent.data ?? []);
    })();
  }, [userId]);

  const cards = [
    { label: "Active Plans", value: stats.activePlans, icon: Activity, hue: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "Total Plans", value: stats.plans, icon: ListChecks, hue: "text-primary bg-primary/10" },
    { label: "Assessments", value: stats.assessments, icon: ClipboardPlus, hue: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
    { label: "Protocols", value: stats.protocols, icon: Library, hue: "text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
    { label: "Asana Library", value: stats.asanas, icon: Flower2, hue: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
    { label: "Logs (7d)", value: stats.logs7, icon: Users, hue: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl">
            <CardContent className="p-4">
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${c.hue}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-semibold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-between" variant="default">
              <Link to="/vaidya/yoga/assessment/new">
                <span className="flex items-center gap-2"><ClipboardPlus className="h-4 w-4" /> New Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="outline">
              <Link to="/vaidya/yoga/plans/new">
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Build a Plan</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between" variant="outline">
              <Link to="/vaidya/yoga/protocols">
                <span className="flex items-center gap-2"><Library className="h-4 w-4" /> Browse Protocols</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No plans yet. Start with a new assessment to generate a personalized plan.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recentPlans.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{p.plan_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.patient_name}{p.condition_name ? ` · ${p.condition_name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/vaidya/yoga/plans/${p.id}`}>Open</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YogaDashboard;
