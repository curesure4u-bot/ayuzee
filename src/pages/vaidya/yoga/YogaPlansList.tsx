import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const YogaPlansList = () => {
  const { userId } = useDoctor();
  const [plans, setPlans] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!userId) return;
    supabase.from("yoga_plans").select("*").eq("doctor_user_id", userId)
      .order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setPlans(data ?? []));
  }, [userId]);

  const filtered = plans.filter((p) =>
    !q || (p.plan_name + p.patient_name + (p.condition_name ?? "")).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search plans, patient, condition…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button asChild>
          <Link to="/vaidya/yoga/plans/new"><Plus className="mr-2 h-4 w-4" /> New Plan</Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="rounded-2xl"><CardContent className="p-8 text-center text-sm text-muted-foreground">No plans yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((p) => (
            <Card key={p.id} className="rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.plan_name}</p>
                    <p className="text-xs text-muted-foreground">{p.patient_name}</p>
                  </div>
                  <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                </div>
                {p.condition_name && (
                  <p className="text-xs text-muted-foreground">Condition · {p.condition_name}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {p.duration_weeks ?? "—"} wks · {p.frequency_per_week ?? "—"}/wk
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/vaidya/yoga/plans/${p.id}`}>Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default YogaPlansList;
