import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, Loader2, ArrowLeft, Save, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

type Draft = {
  ahara_advice: string;
  vihara_advice: string;
  nidra_advice: string;
  dinacharya_measures: string;
  mental_health_advice: string;
};

type DietRow = {
  id?: string;
  plan_id?: string;
  meal_slot: string;
  timing: string; // HH:MM
  food_items: string;
  therapeutic_peya: string;
  _dirty?: boolean;
};

const EMPTY: Draft = {
  ahara_advice: "", vihara_advice: "", nidra_advice: "",
  dinacharya_measures: "", mental_health_advice: "",
};

const FIELDS: { key: keyof Draft; label: string; hint: string }[] = [
  { key: "ahara_advice", label: "Ahara (Diet)", hint: "Foods, rasas, meal composition, timings, hydration." },
  { key: "vihara_advice", label: "Vihara (Lifestyle)", hint: "Activity, screen habits, addictions, Vega dharana." },
  { key: "nidra_advice", label: "Nidra (Sleep)", hint: "Sleep/wake times, quality, Divaswapna guidance." },
  { key: "dinacharya_measures", label: "Dinacharya (Daily regimen)", hint: "Abhyanga, Nasya, Udvartana, Gandusha, Vyayama, etc." },
  { key: "mental_health_advice", label: "Manasika (Mental well-being)", hint: "Sattvavajaya, Dhyana, Pranayama, Sadvritta." },
];

const DEFAULT_SLOTS: Omit<DietRow, "plan_id">[] = [
  { meal_slot: "Morning drink", timing: "06:00", food_items: "", therapeutic_peya: "" },
  { meal_slot: "Breakfast",     timing: "08:30", food_items: "", therapeutic_peya: "" },
  { meal_slot: "Lunch",         timing: "13:30", food_items: "", therapeutic_peya: "" },
  { meal_slot: "Evening tea",   timing: "17:00", food_items: "", therapeutic_peya: "" },
  { meal_slot: "Dinner",        timing: "20:00", food_items: "", therapeutic_peya: "" },
];

const normalizeTime = (t: string | null | undefined) => {
  if (!t) return "";
  // Postgres time comes back as HH:MM:SS
  const parts = t.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return t;
};

const SwasthavrittaReview = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [aiOriginal, setAiOriginal] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [signedOff, setSignedOff] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [dietRows, setDietRows] = useState<DietRow[]>([]);
  const [deletedDietIds, setDeletedDietIds] = useState<string[]>([]);

  const load = async () => {
    if (!assessmentId) return;
    setLoading(true);
    const { data: a } = await supabase
      .from("swasthavritta_assessments" as any)
      .select("*").eq("id", assessmentId).maybeSingle();
    setAssessment(a);
    const { data: p } = await supabase
      .from("swasthavritta_plans" as any)
      .select("*").eq("assessment_id", assessmentId).maybeSingle();
    if (p) {
      const pp = p as any;
      setPlanId(pp.id);
      setSignedOff(!!pp.signed_off);
      setSignedAt(pp.signed_off_at ?? null);
      setAiOriginal((pp.ai_generated_draft as Draft) ?? null);
      setDraft({
        ahara_advice: pp.ahara_advice ?? "",
        vihara_advice: pp.vihara_advice ?? "",
        nidra_advice: pp.nidra_advice ?? "",
        dinacharya_measures: pp.dinacharya_measures ?? "",
        mental_health_advice: pp.mental_health_advice ?? "",
      });

      // Load diet plan rows
      const { data: diets } = await supabase
        .from("diet_plans" as any)
        .select("*").eq("plan_id", pp.id);
      const rows = (diets as any[] | null) ?? [];
      if (rows.length === 0) {
        setDietRows(DEFAULT_SLOTS.map(s => ({ ...s, plan_id: pp.id })));
      } else {
        setDietRows(rows.map(r => ({
          id: r.id,
          plan_id: r.plan_id,
          meal_slot: r.meal_slot ?? "",
          timing: normalizeTime(r.timing),
          food_items: r.food_items ?? "",
          therapeutic_peya: r.therapeutic_peya ?? "",
        })));
      }
      setDeletedDietIds([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [assessmentId]);

  const generate = async () => {
    if (!assessmentId) return;
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("swasthavritta-interpret", {
      body: { assessment_id: assessmentId },
    });
    setGenerating(false);
    if (error) { toast.error(error.message); return; }
    if ((data as any)?.error) { toast.error((data as any).error); return; }
    toast.success("AI draft generated");
    await load();
  };

  const isEdited = (): boolean => {
    if (!aiOriginal) return false;
    return (Object.keys(draft) as (keyof Draft)[]).some(k => (draft[k] ?? "") !== (aiOriginal[k] ?? ""));
  };

  const updateDietRow = (idx: number, patch: Partial<DietRow>) => {
    setDietRows(rows => rows.map((r, i) => i === idx ? { ...r, ...patch, _dirty: true } : r));
  };

  const addDietRow = () => {
    setDietRows(rows => [...rows, {
      plan_id: planId ?? undefined,
      meal_slot: "Snack",
      timing: "11:00",
      food_items: "",
      therapeutic_peya: "",
      _dirty: true,
    }]);
  };

  const removeDietRow = (idx: number) => {
    setDietRows(rows => {
      const r = rows[idx];
      if (r.id) setDeletedDietIds(d => [...d, r.id!]);
      return rows.filter((_, i) => i !== idx);
    });
  };

  const persistDietPlan = async (): Promise<boolean> => {
    if (!planId) return true;
    if (deletedDietIds.length > 0) {
      const { error } = await supabase.from("diet_plans" as any).delete().in("id", deletedDietIds);
      if (error) { toast.error(`Diet delete: ${error.message}`); return false; }
    }
    const toUpdate = dietRows.filter(r => r.id);
    const toInsert = dietRows.filter(r => !r.id).map(r => ({
      plan_id: planId,
      meal_slot: r.meal_slot,
      timing: r.timing || null,
      food_items: r.food_items || null,
      therapeutic_peya: r.therapeutic_peya || null,
    }));
    for (const r of toUpdate) {
      const { error } = await supabase.from("diet_plans" as any).update({
        meal_slot: r.meal_slot,
        timing: r.timing || null,
        food_items: r.food_items || null,
        therapeutic_peya: r.therapeutic_peya || null,
      } as any).eq("id", r.id!);
      if (error) { toast.error(`Diet update: ${error.message}`); return false; }
    }
    if (toInsert.length > 0) {
      const { error } = await supabase.from("diet_plans" as any).insert(toInsert as any);
      if (error) { toast.error(`Diet insert: ${error.message}`); return false; }
    }
    setDeletedDietIds([]);
    return true;
  };

  const saveEdits = async () => {
    if (!planId) return;
    setSaving(true);
    const { error } = await supabase.from("swasthavritta_plans" as any).update({
      ...draft,
      vaidya_edited: isEdited(),
    } as any).eq("id", planId);
    if (error) { setSaving(false); toast.error(error.message); return; }
    const ok = await persistDietPlan();
    setSaving(false);
    if (ok) {
      toast.success("Edits saved");
      await load();
    }
  };

  const signOff = async () => {
    if (!planId) return;
    setSigning(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    const nowIso = new Date().toISOString();
    const { error: pErr } = await supabase.from("swasthavritta_plans" as any).update({
      ...draft,
      vaidya_edited: isEdited(),
      signed_off: true,
      signed_off_by: uid,
      signed_off_at: nowIso,
    } as any).eq("id", planId);
    if (pErr) { setSigning(false); toast.error(pErr.message); return; }
    const ok = await persistDietPlan();
    if (!ok) { setSigning(false); return; }
    await supabase.from("swasthavritta_assessments" as any)
      .update({ status: "signed_off" } as any).eq("id", assessmentId!);
    setSigning(false);
    toast.success("Plan signed off — now visible to the patient");
    setSignedOff(true);
    setSignedAt(nowIso);
  };

  if (loading) {
    return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!assessment) {
    return <div className="p-8 text-center text-muted-foreground">Assessment not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Swasthavritta Plan · Vaidya Review</h1>
          <p className="text-sm text-muted-foreground">
            Assessment status: <span className="font-medium">{assessment.status}</span> · Prakriti: {assessment.prakriti ?? "—"} · BMI: {assessment.bmi ?? "—"}
          </p>
        </div>
        {signedOff ? (
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
            <ShieldCheck className="mr-1 h-3 w-3" /> Signed off {signedAt ? `· ${new Date(signedAt).toLocaleDateString()}` : ""}
          </Badge>
        ) : (
          <Badge variant="outline">Draft</Badge>
        )}
      </div>

      {!planId && (
        <Card className="p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">No AI draft yet for this assessment.</p>
          <Button onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate AI Draft
          </Button>
        </Card>
      )}

      {planId && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {isEdited() ? "Edited from AI draft" : "Unchanged from AI draft"}
            </p>
            <Button variant="outline" size="sm" onClick={generate} disabled={generating || signedOff}>
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Regenerate
            </Button>
          </div>

          {FIELDS.map(f => (
            <Card key={f.key} className="p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <Label className="text-base font-semibold">{f.label}</Label>
                <span className="text-xs text-muted-foreground">{f.hint}</span>
              </div>
              <Textarea
                value={draft[f.key]}
                onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                rows={7}
                disabled={signedOff}
                className="font-normal"
              />
            </Card>
          ))}

          {/* Diet Plan Builder */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Diet Plan (meal-wise)</Label>
              </div>
              <span className="text-xs text-muted-foreground">
                Saved with the plan · visible to patient after sign-off
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-2 font-medium">Meal slot</th>
                    <th className="py-2 pr-2 font-medium">Time</th>
                    <th className="py-2 pr-2 font-medium">Food items + serving</th>
                    <th className="py-2 pr-2 font-medium">Therapeutic peya (optional)</th>
                    <th className="py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {dietRows.map((row, idx) => (
                    <tr key={row.id ?? `new-${idx}`} className="border-b align-top last:border-0">
                      <td className="py-2 pr-2">
                        <Input
                          value={row.meal_slot}
                          onChange={e => updateDietRow(idx, { meal_slot: e.target.value })}
                          disabled={signedOff}
                          className="h-9"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Input
                          type="time"
                          value={row.timing}
                          onChange={e => updateDietRow(idx, { timing: e.target.value })}
                          disabled={signedOff}
                          className="h-9 w-[110px]"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Textarea
                          value={row.food_items}
                          onChange={e => updateDietRow(idx, { food_items: e.target.value })}
                          disabled={signedOff}
                          rows={2}
                          placeholder="e.g. Moong dal khichdi (1 katori), steamed lauki (1/2 cup)"
                          className="min-h-[36px] py-1.5"
                        />
                      </td>
                      <td className="py-2 pr-2">
                        <Textarea
                          value={row.therapeutic_peya}
                          onChange={e => updateDietRow(idx, { therapeutic_peya: e.target.value })}
                          disabled={signedOff}
                          rows={2}
                          placeholder="e.g. Sunthi-jala 100ml"
                          className="min-h-[36px] py-1.5"
                        />
                      </td>
                      <td className="py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDietRow(idx)}
                          disabled={signedOff}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${row.meal_slot}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!signedOff && (
              <Button variant="outline" size="sm" onClick={addDietRow} className="mt-3">
                <Plus className="mr-1 h-4 w-4" /> Add row
              </Button>
            )}
          </Card>

          {!signedOff && (
            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
              <Button variant="outline" onClick={saveEdits} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save edits
              </Button>
              <Button onClick={signOff} disabled={signing}>
                {signing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Sign off & share with patient
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SwasthavrittaReview;
