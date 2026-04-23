import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, CheckCircle2, IndianRupee } from "lucide-react";

type Plan = {
  id: string;
  therapy_name: string;
  planned_date: string | null;
  duration_days: number | null;
  notes: string | null;
  status: string;
  payment_status: string;
  estimated_price: number | null;
  partner_id: string | null;
};

export const PatientTherapyPlans = ({ userId }: { userId: string }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("therapy_plans")
      .select("id, therapy_name, planned_date, duration_days, notes, status, payment_status, estimated_price, partner_id")
      .eq("patient_user_id", userId)
      .order("created_at", { ascending: false });
    setPlans((data ?? []) as Plan[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const confirm = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.from("therapy_plans")
      .update({ payment_status: "paid", confirmed_at: new Date().toISOString(), status: "ongoing" })
      .eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Therapy confirmed! Your therapist will reach out soon.");
    load();
  };

  if (loading) return null;
  if (plans.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl">Therapy plans from your doctor</h2>
        </div>
      </div>
      <div className="grid gap-4">
        {plans.map((p) => {
          const needsPayment = p.payment_status !== "paid";
          return (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{p.therapy_name}</h3>
                    <Badge variant={p.status === "completed" ? "secondary" : "default"} className="capitalize">{p.status}</Badge>
                    {p.payment_status === "paid" && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary"><CheckCircle2 className="mr-1 h-3 w-3" />Confirmed</Badge>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {p.planned_date && (
                      <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />
                        {new Date(p.planned_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        {p.duration_days && p.duration_days > 1 ? ` · ${p.duration_days} days` : ""}
                      </p>
                    )}
                    {p.notes && <p>📝 {p.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  {needsPayment ? (
                    <>
                      {p.estimated_price !== null && p.estimated_price !== undefined && (
                        <p className="font-display text-2xl text-primary flex items-center gap-1 justify-end">
                          <IndianRupee className="h-5 w-5" />{p.estimated_price.toLocaleString("en-IN")}
                        </p>
                      )}
                      <Button variant="hero" className="mt-2" disabled={busy === p.id} onClick={() => confirm(p.id)}>
                        {busy === p.id ? "Confirming…" : "Confirm & Pay"}
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Paid</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
