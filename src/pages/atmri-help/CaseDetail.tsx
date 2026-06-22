import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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

const statusBadge: Record<string, { label: string; cls: string }> = {
  in_treatment: { label: "🟢 In Treatment", cls: "bg-green-500 text-white" },
  approved: { label: "🟡 Treatment Starting", cls: "bg-amber-500 text-white" },
  completed: { label: "✅ Healed", cls: "bg-primary text-primary-foreground" },
};

const CaseDetail = () => {
  const { id } = useParams();
  const [c, setC] = useState<Case | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      // Public case detail uses the PII-free view; only the assigned doctor,
      // submitter, or admin can read the full row via the base table.
      const { data: caseData } = await (supabase as any)
        .from("atmri_sponsored_cases_public")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      setC(caseData as Case | null);
      if (caseData) document.title = `ATMRI Case ${caseData.id.slice(0, 8)} — ATMRI Trust`;
    })();
  }, [id]);

  if (!c) return <main className="container py-20 text-center text-muted-foreground">Loading…</main>;

  const sb = statusBadge[c.status];

  return (
    <main className="min-h-screen bg-background">
      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Case #{c.id.slice(0, 8)}</Badge>
            {sb && <span className={`rounded-full px-3 py-1 text-xs ${sb.cls}`}>{sb.label}</span>}
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold">ATMRI Sponsored Case</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Opened {new Date(c.created_at).toLocaleDateString()}. Patient identity is private — only the assigned doctor and ATMRI Trust admins can view personal details and the full medical record.
          </p>

          <Card className="mt-8 p-6">
            <h3 className="font-display text-xl font-semibold">🏛️ How ATMRI Trust is Helping</h3>
            {c.medicines_cost && c.medicines_cost > 0 ? (
              <div className="mt-4 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">💊 Medicines (free): ₹{Number(c.medicines_cost).toLocaleString("en-IN")}</div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Treatment support is being arranged.</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">🏛️ Funded entirely by ATMRI Trust — no crowdfunding involved.</p>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-dashed border-primary/40 bg-primary/5 p-5 text-center">
            <p className="font-semibold">🩺 Are you an AYUSH doctor?</p>
            <p className="mt-1 text-xs text-muted-foreground">Pledge free consultations to help patients in need.</p>
            <Button asChild size="sm" className="mt-3 w-full"><Link to="/atmri-help/pledge">Pledge Now →</Link></Button>
            <div className="my-4 border-t" />
            <p className="font-semibold">🏥 Are you a hospital?</p>
            <p className="mt-1 text-xs text-muted-foreground">Partner with ATMRI Trust to host treatments.</p>
            <Button asChild size="sm" variant="outline" className="mt-3 w-full"><Link to="/atmri-help/hospitals">Partner →</Link></Button>
          </Card>
        </aside>
      </div>
    </main>
  );
};

export default CaseDetail;
