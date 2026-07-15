import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";

type FoodItem = {
  id: string; name: string; category: string | null;
  rasa: string[] | null; guna: string[] | null; virya: string | null;
  dosha_effect_vata: number | null; dosha_effect_pitta: number | null; dosha_effect_kapha: number | null;
  calories_per_100g: number | null; protein_g: number | null; carbs_g: number | null;
  fat_g: number | null; fiber_g: number | null;
};

type ChartItem = {
  id?: string;
  food_item_id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  day_number: number;
  quantity: number;
  unit: string;
  notes: string;
  food?: FoodItem;
};

const MEALS: ChartItem["meal_type"][] = ["breakfast", "lunch", "dinner", "snack"];

export default function DietChartEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chartId, setChartId] = useState<string | null>(id ?? null);
  const [patients, setPatients] = useState<Array<{ id: string; label: string }>>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [prakriti, setPrakriti] = useState("");
  const [vikriti, setVikriti] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "completed">("draft");
  const [items, setItems] = useState<ChartItem[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState<number[]>([1]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // Food search
  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [foodCache, setFoodCache] = useState<Record<string, FoodItem>>({});
  const [addTarget, setAddTarget] = useState<ChartItem["meal_type"] | null>(null);

  // Load patients (vaidya's patients)
  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("vaidya_patients")
        .select("id, full_name, phone")
        .eq("doctor_user_id", uid)
        .order("full_name");
      const list = (data ?? []).map((r: any) => ({
        id: r.id,
        label: r.full_name || r.phone || r.id.slice(0, 8),
      }));
      setPatients(list);
    })();
  }, []);

  // Load existing chart
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: chart, error } = await supabase
        .from("diet_charts").select("*").eq("id", id).maybeSingle();
      if (error || !chart) {
        toast({ title: "Chart not found", variant: "destructive" });
        setLoading(false);
        return;
      }
      setChartId(chart.id);
      setPatientId(chart.patient_id);
      setTitle(chart.title);
      setPrakriti(chart.prakriti ?? "");
      setVikriti(chart.vikriti_notes ?? "");
      setStatus(chart.status as any);

      const { data: rows } = await supabase
        .from("diet_chart_items")
        .select("*, food:food_items(*)")
        .eq("diet_chart_id", chart.id)
        .order("day_number");
      const loaded = (rows ?? []).map((r: any) => ({
        id: r.id, food_item_id: r.food_item_id, meal_type: r.meal_type,
        day_number: r.day_number, quantity: Number(r.quantity ?? 0),
        unit: r.unit ?? "g", notes: r.notes ?? "", food: r.food,
      }));
      setItems(loaded);
      const uniqueDays = Array.from(new Set(loaded.map((x) => x.day_number))).sort((a, b) => a - b);
      setDays(uniqueDays.length ? uniqueDays : [1]);
      setLoading(false);
    })();
  }, [id]);

  // Food search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!foodSearch.trim()) { setFoodResults([]); return; }
      const { data } = await supabase
        .from("food_items")
        .select("id,name,category,rasa,guna,virya,dosha_effect_vata,dosha_effect_pitta,dosha_effect_kapha,calories_per_100g,protein_g,carbs_g,fat_g,fiber_g")
        .ilike("name", `%${foodSearch}%`)
        .limit(20);
      setFoodResults((data as FoodItem[]) ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [foodSearch]);

  const upsertChart = useCallback(async (): Promise<string | null> => {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) { toast({ title: "Not signed in", variant: "destructive" }); return null; }
    if (!patientId || !title.trim()) {
      toast({ title: "Patient and title required", variant: "destructive" });
      return null;
    }
    const payload = {
      patient_id: patientId,
      vaidya_id: uid,
      title: title.trim(),
      prakriti: prakriti || null,
      vikriti_notes: vikriti || null,
      status,
    };
    if (chartId) {
      const { error } = await supabase.from("diet_charts").update(payload).eq("id", chartId);
      if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return null; }
      return chartId;
    }
    const { data, error } = await supabase.from("diet_charts").insert(payload).select("id").single();
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return null; }
    setChartId(data.id);
    return data.id;
  }, [chartId, patientId, title, prakriti, vikriti, status]);

  const addFood = async (food: FoodItem) => {
    if (!addTarget) return;
    const cid = chartId ?? await upsertChart();
    if (!cid) return;
    const payload = {
      diet_chart_id: cid,
      food_item_id: food.id,
      meal_type: addTarget,
      day_number: activeDay,
      quantity: 100,
      unit: "g",
    };
    const { data, error } = await supabase.from("diet_chart_items").insert(payload).select("id").single();
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    setItems((prev) => [...prev, {
      id: data.id, food_item_id: food.id, meal_type: addTarget,
      day_number: activeDay, quantity: 100, unit: "g", notes: "", food,
    }]);
    setFoodCache((c) => ({ ...c, [food.id]: food }));
    setAddTarget(null);
    setFoodSearch("");
    setFoodResults([]);
  };

  const updateItem = async (idx: number, patch: Partial<ChartItem>) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    setItems(next);
    const it = next[idx];
    if (it.id) {
      await supabase.from("diet_chart_items").update({
        quantity: it.quantity, unit: it.unit, notes: it.notes,
      }).eq("id", it.id);
    }
  };

  const removeItem = async (idx: number) => {
    const it = items[idx];
    if (it.id) await supabase.from("diet_chart_items").delete().eq("id", it.id);
    setItems(items.filter((_, i) => i !== idx));
  };

  const addDay = () => {
    const next = Math.max(...days) + 1;
    setDays([...days, next]);
    setActiveDay(next);
  };

  const saveDraft = async () => {
    setSaving(true);
    await upsertChart();
    setSaving(false);
    toast({ title: "Draft saved" });
  };

  const activate = async () => {
    setStatus("active");
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    const payload = {
      patient_id: patientId, vaidya_id: uid!, title: title.trim(),
      prakriti: prakriti || null, vikriti_notes: vikriti || null, status: "active",
    };
    if (chartId) {
      await supabase.from("diet_charts").update(payload).eq("id", chartId);
    } else {
      const { data } = await supabase.from("diet_charts").insert(payload).select("id").single();
      if (data) setChartId(data.id);
    }
    setSaving(false);
    toast({ title: "Chart activated — patient can now see it" });
  };

  // Dosha impact for active day
  const dayItems = items.filter((it) => it.day_number === activeDay);
  const dosha = useMemo(() => {
    let v = 0, p = 0, k = 0;
    for (const it of dayItems) {
      const grams = it.unit === "g" ? it.quantity : it.quantity * 50; // rough non-gram approx
      const weight = grams / 100;
      const f = it.food ?? foodCache[it.food_item_id];
      if (!f) continue;
      v += (f.dosha_effect_vata ?? 0) * weight;
      p += (f.dosha_effect_pitta ?? 0) * weight;
      k += (f.dosha_effect_kapha ?? 0) * weight;
    }
    return { vata: Math.round(v * 10) / 10, pitta: Math.round(p * 10) / 10, kapha: Math.round(k * 10) / 10 };
  }, [dayItems, foodCache]);

  const prakritiFocus = useMemo(() => {
    const p = prakriti.toLowerCase();
    return { vata: p.includes("vata"), pitta: p.includes("pitta"), kapha: p.includes("kapha") };
  }, [prakriti]);

  const doshaColor = (dosha: "vata" | "pitta" | "kapha", value: number) => {
    if (!prakritiFocus[dosha]) return "text-foreground";
    if (value > 0.5) return "text-red-600";
    if (value < -0.5) return "text-green-600";
    return "text-muted-foreground";
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">{chartId ? "Edit diet chart" : "New diet chart"}</h1>
          <p className="text-sm text-muted-foreground">Build a day-wise meal plan combining Ayurvedic + nutritional guidance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveDraft} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save draft
          </Button>
          <Button onClick={activate} disabled={saving}>Activate chart</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Chart title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kapha pacifying, 7-day" />
          </div>
          <div>
            <Label>Prakriti</Label>
            <Select value={prakriti} onValueChange={setPrakriti}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"].map((x) =>
                  <SelectItem key={x} value={x}>{x}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Label>Vikriti / clinical notes</Label>
            <Textarea rows={2} value={vikriti} onChange={(e) => setVikriti(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Tabs value={String(activeDay)} onValueChange={(v) => setActiveDay(Number(v))}>
            <div className="flex items-center gap-2">
              <TabsList>
                {days.map((d) => <TabsTrigger key={d} value={String(d)}>Day {d}</TabsTrigger>)}
              </TabsList>
              <Button size="sm" variant="outline" onClick={addDay}><Plus className="w-3 h-3 mr-1" />Add day</Button>
            </div>

            {days.map((d) => (
              <TabsContent key={d} value={String(d)} className="space-y-4">
                {MEALS.map((meal) => {
                  const mealItems = items.map((it, idx) => ({ it, idx })).filter(({ it }) => it.day_number === d && it.meal_type === meal);
                  return (
                    <Card key={meal}>
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="capitalize text-base">{meal}</CardTitle>
                        <Button size="sm" variant="outline" onClick={() => setAddTarget(meal)}>
                          <Plus className="w-3 h-3 mr-1" />Add food
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {addTarget === meal && d === activeDay && (
                          <div className="p-3 border rounded-md bg-muted/30">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                              <Input autoFocus className="pl-8" placeholder="Search food…" value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} />
                            </div>
                            {foodResults.length > 0 && (
                              <div className="mt-2 max-h-64 overflow-y-auto border rounded-md bg-background">
                                {foodResults.map((f) => (
                                  <button key={f.id} className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between items-center"
                                    onClick={() => addFood(f)}>
                                    <span>{f.name}</span>
                                    <span className="text-xs text-muted-foreground">{f.category}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 text-right">
                              <Button size="sm" variant="ghost" onClick={() => { setAddTarget(null); setFoodSearch(""); }}>Cancel</Button>
                            </div>
                          </div>
                        )}

                        {mealItems.length === 0 && <div className="text-sm text-muted-foreground italic">No items yet.</div>}
                        {mealItems.map(({ it, idx }) => {
                          const f = it.food ?? foodCache[it.food_item_id];
                          const scale = f?.calories_per_100g != null ? (it.quantity / 100) : 0;
                          return (
                            <div key={idx} className="border rounded-md p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <div className="font-medium">{f?.name ?? "…"}</div>
                                <div className="mt-2 flex gap-2 items-center">
                                  <Input type="number" className="w-20" value={it.quantity}
                                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                                  <Select value={it.unit} onValueChange={(v) => updateItem(idx, { unit: v })}>
                                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {["g", "ml", "katori", "piece", "cup", "tbsp", "tsp"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                                <Input className="mt-2" placeholder="Notes for patient…" value={it.notes}
                                  onChange={(e) => updateItem(idx, { notes: e.target.value })} />
                              </div>
                              <div className="text-xs bg-amber-50 dark:bg-amber-950/30 rounded p-2 space-y-1">
                                <div className="font-semibold text-amber-900 dark:text-amber-200">Ayurvedic</div>
                                <div>Rasa: {(f?.rasa ?? []).join(", ") || "—"}</div>
                                <div>Guna: {(f?.guna ?? []).join(", ") || "—"}</div>
                                <div>Virya: {f?.virya ?? "—"}</div>
                                <div className="font-mono">V/P/K: {f?.dosha_effect_vata ?? 0} / {f?.dosha_effect_pitta ?? 0} / {f?.dosha_effect_kapha ?? 0}</div>
                              </div>
                              <div className="text-xs bg-sky-50 dark:bg-sky-950/30 rounded p-2 space-y-1">
                                <div className="font-semibold text-sky-900 dark:text-sky-200">Nutrition (scaled)</div>
                                <div>Calories: {f?.calories_per_100g != null ? Math.round((f.calories_per_100g ?? 0) * scale) : "—"}</div>
                                <div>Protein: {f?.protein_g != null ? ((f.protein_g ?? 0) * scale).toFixed(1) + " g" : "—"}</div>
                                <div>Carbs: {f?.carbs_g != null ? ((f.carbs_g ?? 0) * scale).toFixed(1) + " g" : "—"}</div>
                                <div>Fat: {f?.fat_g != null ? ((f.fat_g ?? 0) * scale).toFixed(1) + " g" : "—"}</div>
                                <div>Fiber: {f?.fiber_g != null ? ((f.fiber_g ?? 0) * scale).toFixed(1) + " g" : "—"}</div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Dosha impact — Day {activeDay}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["vata", "pitta", "kapha"] as const).map((d) => {
                const val = dosha[d];
                const pct = Math.min(100, Math.abs(val) * 20);
                return (
                  <div key={d}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">
                        {d} {prakritiFocus[d] && <Badge variant="outline" className="ml-1 text-xs">focus</Badge>}
                      </span>
                      <span className={`font-mono ${doshaColor(d, val)}`}>
                        {val > 0 ? "+" : ""}{val}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div className={`h-full ${val > 0 ? "bg-red-400" : "bg-green-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Red = aggravating, green = pacifying — relative to the patient's prakriti focus.
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                {dayItems.length} item{dayItems.length !== 1 ? "s" : ""} · Cal ≈ {
                  Math.round(dayItems.reduce((s, it) => {
                    const f = it.food ?? foodCache[it.food_item_id];
                    return s + ((f?.calories_per_100g ?? 0) * (it.quantity / 100));
                  }, 0))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
