import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Leaf, UtensilsCrossed, Save, MessageCircle, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  ahara_advice: string | null;
  vihara_advice: string | null;
  nidra_advice: string | null;
  dinacharya_measures: string | null;
  signed_off_at: string | null;
};

type Diet = {
  id: string;
  meal_slot: string;
  timing: string | null;
  food_items: string | null;
  therapeutic_peya: string | null;
};

type LogRow = {
  log_date: string;
  checklist: Record<string, boolean> | null;
};

// Build checklist keys from plan
const buildChecklistKeys = (plan: Plan | null, diets: Diet[]): string[] => {
  const keys: string[] = [];
  if (plan?.dinacharya_measures) {
    plan.dinacharya_measures.split(/\r?\n|•|·|\u2022|;/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2)
      .slice(0, 12)
      .forEach((line) => keys.push(`dina::${line}`));
  }
  diets.forEach((d) => keys.push(`meal::${d.meal_slot}`));
  return keys;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export const SwasthavrittaPlanCard = ({ userId }: { userId: string }) => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [todayChecklist, setTodayChecklist] = useState<Record<string, boolean>>({});
  const [weekLogs, setWeekLogs] = useState<LogRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const checklistKeys = useMemo(() => buildChecklistKeys(plan, diets), [plan, diets]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Assessments for this patient
      const { data: assessments } = await supabase
        .from("swasthavritta_assessments" as any)
        .select("id")
        .eq("patient_id", userId);
      const ids = ((assessments as any[]) ?? []).map((a) => a.id);
      if (ids.length === 0) { setLoading(false); return; }

      const { data: p } = await supabase
        .from("swasthavritta_plans" as any)
        .select("id, ahara_advice, vihara_advice, nidra_advice, dinacharya_measures, signed_off_at, signed_off")
        .in("assessment_id", ids)
        .eq("signed_off", true)
        .order("signed_off_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!p) { setLoading(false); return; }
      const pp = p as any as Plan;
      setPlan(pp);

      const [dietsRes, logsRes] = await Promise.all([
        supabase.from("diet_plans" as any).select("*").eq("plan_id", pp.id),
        (() => {
          const from = new Date(); from.setDate(from.getDate() - 6);
          return supabase.from("daily_regimen_logs" as any)
            .select("log_date, checklist")
            .eq("patient_id", userId)
            .eq("plan_id", pp.id)
            .gte("log_date", from.toISOString().slice(0, 10))
            .order("log_date", { ascending: true });
        })(),
      ]);
      const dietRows = ((dietsRes.data as any[]) ?? []) as Diet[];
      setDiets(dietRows);
      const logRows = ((logsRes.data as any[]) ?? []) as LogRow[];
      setWeekLogs(logRows);

      const today = logRows.find((l) => String(l.log_date).slice(0, 10) === todayStr());
      setTodayChecklist((today?.checklist as Record<string, boolean>) ?? {});
      setLoading(false);
    })();
  }, [userId]);

  const toggle = (k: string) =>
    setTodayChecklist((c) => ({ ...c, [k]: !c[k] }));

  const saveLog = async () => {
    if (!plan) return;
    setSaving(true);
    // Ensure every key exists in checklist for accurate adherence
    const filled: Record<string, boolean> = {};
    checklistKeys.forEach((k) => { filled[k] = !!todayChecklist[k]; });

    const { error } = await supabase.from("daily_regimen_logs" as any).upsert({
      patient_id: userId,
      plan_id: plan.id,
      log_date: todayStr(),
      checklist: filled,
    } as any, { onConflict: "patient_id,plan_id,log_date" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Today's log saved");

    // Refresh week logs
    const from = new Date(); from.setDate(from.getDate() - 6);
    const { data: fresh } = await supabase.from("daily_regimen_logs" as any)
      .select("log_date, checklist")
      .eq("patient_id", userId)
      .eq("plan_id", plan.id)
      .gte("log_date", from.toISOString().slice(0, 10));
    setWeekLogs(((fresh as any[]) ?? []) as LogRow[]);
  };

  const notifyVaidya = async () => {
    setNotifying(true);
    const { data, error } = await supabase.functions.invoke("swasthavritta-notify-vaidya", {
      body: {},
    });
    setNotifying(false);
    if (error) { toast.error(error.message); return; }
    if ((data as any)?.error) { toast.error((data as any).error); return; }
    toast.success("Vaidya notified via WhatsApp");
  };

  // 7-day adherence
  const week = useMemo(() => {
    const out: { date: string; label: string; pct: number; has: boolean }[] = [];
    const from = new Date(); from.setDate(from.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(from); d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const row = weekLogs.find((l) => String(l.log_date).slice(0, 10) === key);
      const label = d.toLocaleDateString("en-IN", { weekday: "short" });
      if (!row?.checklist) { out.push({ date: key, label, pct: 0, has: false }); continue; }
      const items = Object.values(row.checklist);
      const done = items.filter(Boolean).length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      out.push({ date: key, label, pct, has: true });
    }
    return out;
  }, [weekLogs]);

  if (loading) return null;
  if (!plan) return null; // Hidden if no signed-off plan

  return (
    <section className="mt-8">
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl">My Swasthavritta Plan</h2>
              <p className="text-xs text-muted-foreground">
                Signed off {plan.signed_off_at ? new Date(plan.signed_off_at).toLocaleDateString() : "—"} by your Vaidya
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
            <ShieldCheck className="mr-1 h-3 w-3" /> Active
          </Badge>
        </div>

        {/* Read-only advice */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Ahara (Diet)", body: plan.ahara_advice },
            { label: "Vihara (Lifestyle)", body: plan.vihara_advice },
            { label: "Nidra (Sleep)", body: plan.nidra_advice },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-muted/30 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">
                {s.body || "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Diet plan by meal slot */}
        {diets.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Diet plan</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {diets.map((d) => (
                <div key={d.id} className="rounded-lg border p-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{d.meal_slot}</p>
                    {d.timing && (
                      <span className="text-xs text-muted-foreground">{String(d.timing).slice(0, 5)}</span>
                    )}
                  </div>
                  {d.food_items && <p className="mt-0.5 text-xs text-muted-foreground">{d.food_items}</p>}
                  {d.therapeutic_peya && (
                    <p className="mt-0.5 text-xs italic text-primary/80">Peya: {d.therapeutic_peya}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's checklist */}
        {checklistKeys.length > 0 && (
          <div className="mt-5 rounded-xl border bg-card p-3">
            <p className="mb-2 text-sm font-semibold">Today's checklist</p>
            <ul className="space-y-1.5">
              {checklistKeys.map((k) => {
                const [kind, ...rest] = k.split("::");
                const label = rest.join("::");
                return (
                  <li key={k} className="flex items-start gap-2">
                    <Checkbox
                      id={`chk-${k}`}
                      checked={!!todayChecklist[k]}
                      onCheckedChange={() => toggle(k)}
                      className="mt-0.5"
                    />
                    <label htmlFor={`chk-${k}`} className="cursor-pointer text-sm leading-snug">
                      {kind === "meal" ? (
                        <span><span className="text-muted-foreground">Meal:</span> {label}</span>
                      ) : label}
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={saveLog} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save today's log
              </Button>
              <Button size="sm" variant="outline" onClick={notifyVaidya} disabled={notifying}>
                {notifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
                Notify my Vaidya
              </Button>
            </div>
          </div>
        )}

        {/* 7-day adherence */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Last 7 days</p>
          <div className="flex items-end gap-1.5">
            {week.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-muted">
                  <div
                    className={`w-full transition-all ${d.has ? "bg-primary" : "bg-muted-foreground/20"}`}
                    style={{ height: `${d.has ? Math.max(d.pct, 4) : 4}%` }}
                    title={d.has ? `${d.pct}%` : "No log"}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.label[0]}</span>
                <span className="text-[10px] font-medium">{d.has ? `${d.pct}%` : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SwasthavrittaPlanCard;
