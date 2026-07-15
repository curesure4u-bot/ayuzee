import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Leaf } from "lucide-react";
import { STOOL_TYPES, RISK_LABEL } from "@/data/ashtavidha";

type Row = {
  id: string; assessment_date: string; stool_type: number;
  dosha: string | null; agni: string | null; ama: string | null; risk_level: string | null;
  diet_advice: string | null; lifestyle_advice: string | null; red_flag_warning: string | null;
};

const PatientMalaReports = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) { setLoading(false); return; }
      const { data } = await (supabase as any)
        .from("mala_pareeksha_assessments")
        .select("id,assessment_date,stool_type,dosha,agni,ama,risk_level,diet_advice,lifestyle_advice,red_flag_warning")
        .eq("patient_user_id", uid)
        .order("assessment_date", { ascending: false });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ayuzee · Your reports</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[hsl(150,45%,18%)]">Mala Pareeksha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A simple summary of your stool assessment and Ayurvedic guidance from your Vaidya.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">No reports yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const st = STOOL_TYPES.find((s) => s.id === r.stool_type);
            return (
              <Card key={r.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-primary" />
                      <h3 className="font-display text-lg font-semibold">{st?.name}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.assessment_date}</div>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">{st?.interpretation}</p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {r.dosha && <Badge variant="outline">{r.dosha}</Badge>}
                    {r.agni && <Badge variant="outline">{r.agni}</Badge>}
                    {r.ama && <Badge variant="outline">Ama: {r.ama}</Badge>}
                  </div>

                  {(r.diet_advice || r.lifestyle_advice || st?.advice) && (
                    <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
                      <div className="font-semibold">Food & lifestyle suggestions</div>
                      {r.diet_advice && <p className="mt-1 text-muted-foreground"><span className="font-medium text-foreground">Diet:</span> {r.diet_advice}</p>}
                      {r.lifestyle_advice && <p className="mt-1 text-muted-foreground"><span className="font-medium text-foreground">Lifestyle:</span> {r.lifestyle_advice}</p>}
                      {!r.diet_advice && !r.lifestyle_advice && st?.advice && (
                        <p className="mt-1 text-muted-foreground">{st.advice}</p>
                      )}
                    </div>
                  )}

                  {(r.risk_level === "urgent" || r.risk_level === "attention" || r.red_flag_warning) && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-orange-300 bg-orange-50 p-3 text-sm text-orange-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>
                        <div className="font-semibold">
                          {r.risk_level === "urgent" ? "Please contact your doctor soon." : "Kindly follow up with your Vaidya."}
                        </div>
                        {r.red_flag_warning && <div className="text-xs">{r.red_flag_warning}</div>}
                        {r.risk_level && <div className="mt-1 text-[11px] uppercase tracking-widest">{RISK_LABEL[r.risk_level]}</div>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-6 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
        This information supports your understanding — it does not replace direct medical examination or emergency care.
        If you notice blood in stool, black stool, severe diarrhea, dehydration or fever, please seek medical help immediately.
      </p>
    </div>
  );
};

export default PatientMalaReports;
