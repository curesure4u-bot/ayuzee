import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Activity, ShieldAlert } from "lucide-react";

type Case = {
  id: string;
  patient_name: string;
  chief_complaint: string;
  pain_severity: number | null;
  status: string;
  selected_procedure: string | null;
  created_at: string;
};

const ParaSurgicalDashboard = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("parasurgical_cases")
        .select("id, patient_name, chief_complaint, pain_severity, status, selected_procedure, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setCases((data as Case[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Ayuzee AYUSH Para-Surgical Therapy AI
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold">
            Procedure Planning & Outcomes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Intelligent point mapping, technique selection, documentation & follow-up.
          </p>
        </div>
        <Button asChild variant="hero">
          <Link to="/vaidya/parasurgical/new">
            <Plus className="mr-2 h-4 w-4" /> New Case Assessment
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI procedure selector
            </CardTitle>
            <CardDescription>
              Symptom-aware ranking across 10 AYUSH para-surgical modalities.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Body point mapping
            </CardTitle>
            <CardDescription>
              Marma, Varmam, Acu, Tung, Trigger points on front/back diagrams.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Safety first
            </CardTitle>
            <CardDescription>
              Contraindication checks, bleeding/diabetes/pregnancy alerts.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent cases</CardTitle>
          <CardDescription>Decision-support records you have created or are assigned to.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : cases.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No cases yet. Start with{" "}
              <Link className="text-primary underline" to="/vaidya/parasurgical/new">
                a new assessment
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cases.map((c) => (
                <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.patient_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{c.chief_complaint}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.pain_severity != null && (
                      <Badge variant="outline">Pain {c.pain_severity}/10</Badge>
                    )}
                    {c.selected_procedure && (
                      <Badge variant="secondary" className="hidden md:inline-flex">
                        {c.selected_procedure}
                      </Badge>
                    )}
                    <Badge>{c.status}</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/vaidya/parasurgical/${c.id}`}>Open</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Decision support only. Final procedure selection must be performed by a licensed qualified
        professional. • Precision Procedures • Intelligent Healing • Powered by Ayuzee AI
      </p>
    </div>
  );
};

export default ParaSurgicalDashboard;
