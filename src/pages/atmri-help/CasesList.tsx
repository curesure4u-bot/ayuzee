import {  useEffect, useMemo, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Case = {
  id: string;
  status: string;
  medicines_cost: number | null;
  created_at: string;
  assigned_doctor_user_id: string | null;
};

const filters = [
  { key: "all", label: "All" },
  { key: "in_treatment", label: "In Treatment" },
  { key: "completed", label: "Completed" },
];

const statusBadge: Record<string, { label: string; cls: string }> = {
  in_treatment: { label: "🟢 In Treatment", cls: "bg-green-500 text-white" },
  approved: { label: "🟡 Treatment Starting", cls: "bg-amber-500 text-white" },
  completed: { label: "✅ Healed", cls: "bg-primary text-primary-foreground" },
};

const CasesList = () => {
  usePageSEO({ title: "ATMRI Sponsored Cases — Real Patients, Real Healing" });
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { (async () => {
      // Patient PII is no longer publicly readable. Public listing exposes only
      // case status / cost / timestamps via the safe view.
      const { data } = await (supabase as any)
        .from("atmri_sponsored_cases_public")
        .select("id,status,medicines_cost,created_at,assigned_doctor_user_id")
        .order("created_at", { ascending: false });
      setCases((data ?? []) as Case[]);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return cases;
    return cases.filter((c) => c.status === filter);
  }, [cases, filter]);

  return (
    <main className="min-h-screen bg-background">
      <section className="container py-10">
        <h1 className="font-display text-4xl font-semibold">🌿 ATMRI Sponsored Cases</h1>
        <p className="mt-1 text-muted-foreground">
          Real patients funded entirely by ATMRI Trust. Patient identities are protected — only the assigned doctor and trust admins can view personal details.
        </p>

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
              <Card key={c.id} className="overflow-hidden p-5 transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Case #{c.id.slice(0, 8)}</span>
                  {sb && <span className={`rounded-full px-3 py-1 text-xs ${sb.cls}`}>{sb.label}</span>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Opened {new Date(c.created_at).toLocaleDateString()}</p>
                {c.medicines_cost && c.medicines_cost > 0 && (
                  <p className="mt-2 text-sm">💊 Medicines funded: ₹{Number(c.medicines_cost).toLocaleString("en-IN")}</p>
                )}
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to={`/atmri-help/cases/${c.id}`}>View case →</Link>
                </Button>
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
