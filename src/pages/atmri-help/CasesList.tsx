import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Case = {
  id: string;
  patient_name: string;
  patient_city: string;
  patient_state: string;
  patient_story: string;
  condition_name: string;
  condition_category: string | null;
  status: string;
  is_urgent: boolean;
  patient_photo_url: string | null;
  treatment_location: string | null;
  sessions_completed: number;
  total_sessions_planned: number;
  assigned_doctor_id: string | null;
};

const filters = [
  { key: "all", label: "All" },
  { key: "neurological", label: "Neurological" },
  { key: "orthopaedic", label: "Orthopaedic" },
  { key: "women_health", label: "Women's Health" },
  { key: "paediatric", label: "Paediatric" },
  { key: "urgent", label: "Urgent" },
  { key: "completed", label: "Completed" },
];

const statusBadge: Record<string, { label: string; cls: string }> = {
  in_treatment: { label: "🟢 In Treatment", cls: "bg-green-500 text-white" },
  approved: { label: "🟡 Treatment Starting", cls: "bg-amber-500 text-white" },
  completed: { label: "✅ Healed", cls: "bg-primary text-primary-foreground" },
};

const CasesList = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    document.title = "ATMRI Sponsored Cases — Real Patients, Real Healing";
    (async () => {
      const { data } = await (supabase as any)
        .from("atmri_sponsored_cases")
        .select("id,patient_name,patient_city,patient_state,patient_story,condition_name,condition_category,status,is_urgent,patient_photo_url,treatment_location,sessions_completed,total_sessions_planned,assigned_doctor_id")
        .in("status", ["approved", "in_treatment", "completed"])
        .order("is_urgent", { ascending: false })
        .order("created_at", { ascending: false });
      setCases((data ?? []) as Case[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return cases;
    if (filter === "urgent") return cases.filter((c) => c.is_urgent);
    if (filter === "completed") return cases.filter((c) => c.status === "completed");
    return cases.filter((c) => c.condition_category === filter);
  }, [cases, filter]);

  return (
    <main className="min-h-screen bg-background">
      <section className="container py-10">
        <h1 className="font-display text-4xl font-semibold">🌿 ATMRI Sponsored Cases</h1>
        <p className="mt-1 text-muted-foreground">Real Patients, Real Healing — funded entirely by ATMRI Trust.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${filter === f.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const sb = statusBadge[c.status];
            return (
              <Card key={c.id} className="overflow-hidden transition-all hover:-translate-y-1">
                <div className="relative h-44 bg-gradient-to-br from-primary/20 to-accent">
                  {c.patient_photo_url ? (
                    <img src={c.patient_photo_url} alt={c.patient_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center font-display text-5xl text-primary">{c.patient_name.charAt(0)}</div>
                  )}
                  {sb && <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs ${sb.cls}`}>{sb.label}</span>}
                  {c.is_urgent && c.status !== "completed" && (
                    <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs text-white">🔴 URGENT</span>
                  )}
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-accent px-2 py-1 text-xs text-primary">{c.condition_name}</span>
                  <p className="mt-2 text-lg font-semibold">{c.patient_name}</p>
                  <p className="text-sm text-muted-foreground">{c.patient_city}, {c.patient_state}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.patient_story}</p>
                  {c.treatment_location && <p className="mt-3 text-xs text-muted-foreground">🏥 {c.treatment_location}</p>}
                  {c.status === "in_treatment" && c.total_sessions_planned > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">Session {c.sessions_completed} of {c.total_sessions_planned}</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (c.sessions_completed / c.total_sessions_planned) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                    <Link to={`/atmri-help/cases/${c.id}`}>Read Story →</Link>
                  </Button>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No cases match this filter yet.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default CasesList;
