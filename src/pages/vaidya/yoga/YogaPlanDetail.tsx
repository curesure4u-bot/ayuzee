import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, GripVertical, Flower2, Wind, Brain, Loader2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import {
  startAyuzeePdf, addTitle, addPlainTable, addSectionTable,
  finalizeAyuzeePdf, safeFileName,
} from "@/lib/pdf/ayuzeePdf";

type Section = "warmup" | "main" | "pranayama" | "meditation" | "relaxation";
type Kind = "asana" | "pranayama" | "meditation";

const SECTIONS: { id: Section; label: string; icon: any; kind: Kind }[] = [
  { id: "warmup", label: "Warm-up", icon: Flower2, kind: "asana" },
  { id: "main", label: "Main Asanas", icon: Flower2, kind: "asana" },
  { id: "pranayama", label: "Pranayama", icon: Wind, kind: "pranayama" },
  { id: "meditation", label: "Meditation", icon: Brain, kind: "meditation" },
  { id: "relaxation", label: "Relaxation", icon: Flower2, kind: "asana" },
];

const YogaPlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [libs, setLibs] = useState<{ asanas: any[]; pranayamas: any[]; meditations: any[] }>({
    asanas: [], pranayamas: [], meditations: [],
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [p, i, a, pr, m] = await Promise.all([
      supabase.from("yoga_plans").select("*").eq("id", id).maybeSingle(),
      supabase.from("yoga_plan_items").select("*, yoga_asanas(sanskrit_name, english_name), yoga_pranayamas(name), yoga_meditations(name)").eq("plan_id", id).order("sort_order"),
      supabase.from("yoga_asanas").select("id, sanskrit_name, english_name, category").eq("is_published", true).order("sanskrit_name").limit(200),
      supabase.from("yoga_pranayamas").select("id, name, category").eq("is_published", true).order("name"),
      supabase.from("yoga_meditations").select("id, name, meditation_type").eq("is_published", true).order("name"),
    ]);
    setPlan(p.data);
    setItems(i.data ?? []);
    setLibs({ asanas: a.data ?? [], pranayamas: pr.data ?? [], meditations: m.data ?? [] });
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const grouped = useMemo(() => {
    const g: Record<Section, any[]> = { warmup: [], main: [], pranayama: [], meditation: [], relaxation: [] };
    items.forEach((it) => g[it.section as Section]?.push(it));
    return g;
  }, [items]);

  const addItem = async (section: Section, kind: Kind, refId: string, duration = 90) => {
    if (!id) return;
    const order = (items.filter((i) => i.section === section).length || 0) + 1;
    const payload: any = {
      plan_id: id, section, item_kind: kind,
      sort_order: items.length + order, duration_seconds: duration, repetitions: 1,
    };
    if (kind === "asana") payload.asana_id = refId;
    if (kind === "pranayama") { payload.pranayama_id = refId; payload.duration_seconds = 300; }
    if (kind === "meditation") { payload.meditation_id = refId; payload.duration_seconds = 600; }
    const { error } = await supabase.from("yoga_plan_items").insert([payload]);
    if (error) { toast.error(error.message); return; }
    toast.success("Added");
    load();
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from("yoga_plan_items").delete().eq("id", itemId);
    if (error) { toast.error(error.message); return; }
    setItems((cur) => cur.filter((c) => c.id !== itemId));
  };

  const updatePlanField = async (patch: any) => {
    if (!id) return;
    const { error } = await supabase.from("yoga_plans").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setPlan((p: any) => ({ ...p, ...patch }));
  };

  if (loading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!plan) return <p className="text-sm text-muted-foreground">Plan not found.</p>;

  const totalMinutes = Math.round(items.reduce((s, i) => s + (i.duration_seconds ?? 0), 0) / 60);

  const downloadPDF = () => {
    if (!plan) return;
    const { doc } = startAyuzeePdf({
      clinicName: "Ayuzee Yoga Therapy",
      subtitle: plan.plan_name || "Yoga Plan",
    });
    let y = addTitle(doc, 38, "Yoga Therapy Plan", new Date().toLocaleDateString("en-IN"));
    y = addPlainTable(doc, y, [
      ["Patient", plan.patient_name || "—"],
      ["Plan", plan.plan_name || "—"],
      ["Condition", plan.condition_name || "—"],
      ["Status", plan.status || "—"],
      ["Duration (weeks)", plan.duration_weeks ?? "—"],
      ["Sessions / week", plan.frequency_per_week ?? "—"],
      ["Session length", `${totalMinutes} min`],
    ]);

    SECTIONS.forEach((sec) => {
      const rows = grouped[sec.id];
      if (!rows || rows.length === 0) return;
      y = addSectionTable(doc, y, {
        title: sec.label,
        head: ["#", "Item", "English / Detail", "Duration", "Reps"],
        body: rows.map((it: any, i: number) => {
          const name =
            it.yoga_asanas?.sanskrit_name ||
            it.yoga_pranayamas?.name ||
            it.yoga_meditations?.name ||
            "—";
          const sub = it.yoga_asanas?.english_name || "";
          const mins = Math.round((it.duration_seconds ?? 0) / 60);
          return [
            i + 1,
            name,
            sub,
            mins ? `${mins} min` : `${it.duration_seconds ?? 0}s`,
            it.repetitions || 1,
          ];
        }),
        columnStyles: { 0: { cellWidth: 8 } },
      });
    });

    if (plan.doctor_notes) {
      y = addSectionTable(doc, y, {
        title: "Doctor notes",
        body: [[plan.doctor_notes]],
      });
    }
    if (plan.precautions?.length) {
      y = addSectionTable(doc, y, {
        title: "Precautions",
        body: plan.precautions.map((p: string, i: number) => [String(i + 1), p]),
        columnStyles: { 0: { cellWidth: 8 } },
      });
    }

    finalizeAyuzeePdf(
      doc,
      `Yoga-Plan-${safeFileName(plan.patient_name)}-${Date.now()}.pdf`,
      "Generated by Ayuzee Yoga",
    );
    toast.success("PDF downloaded");
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Plan for {plan.patient_name}</p>
              <h2 className="font-display text-xl font-semibold">{plan.plan_name}</h2>
              {plan.condition_name && <Badge variant="outline" className="mt-1">{plan.condition_name}</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={plan.status === "active" ? "default" : "secondary"}>{plan.status}</Badge>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <FileText className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Field label="Duration (weeks)">
              <Input type="number" defaultValue={plan.duration_weeks ?? ""} onBlur={(e) => updatePlanField({ duration_weeks: Number(e.target.value) || null })} />
            </Field>
            <Field label="Per week">
              <Input type="number" defaultValue={plan.frequency_per_week ?? ""} onBlur={(e) => updatePlanField({ frequency_per_week: Number(e.target.value) || null })} />
            </Field>
            <Field label="Status">
              <Select value={plan.status} onValueChange={(v) => updatePlanField({ status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Total session length"><Input value={`${totalMinutes} min`} disabled /></Field>
            <Field label="Doctor notes" className="sm:col-span-4">
              <Textarea rows={2} defaultValue={plan.doctor_notes ?? ""} onBlur={(e) => updatePlanField({ doctor_notes: e.target.value })} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {SECTIONS.map((sec) => (
        <Card key={sec.id} className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <sec.icon className="h-4 w-4 text-primary" /> {sec.label}
              <Badge variant="secondary" className="ml-1">{grouped[sec.id].length}</Badge>
            </CardTitle>
            <AddItemDialog section={sec.id} kind={sec.kind} libs={libs} onAdd={addItem} />
          </CardHeader>
          <CardContent>
            {grouped[sec.id].length === 0 ? (
              <p className="text-sm text-muted-foreground">No items. Add from library.</p>
            ) : (
              <ul className="space-y-2">
                {grouped[sec.id].map((it) => {
                  const name =
                    it.yoga_asanas?.sanskrit_name ||
                    it.yoga_pranayamas?.name ||
                    it.yoga_meditations?.name ||
                    "—";
                  const sub = it.yoga_asanas?.english_name;
                  return (
                    <li key={it.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{name}</p>
                        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                      </div>
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {Math.round((it.duration_seconds ?? 0) / 60) || "<1"} min
                      </Badge>
                      {it.repetitions && it.repetitions > 1 && (
                        <Badge variant="outline">×{it.repetitions}</Badge>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => removeItem(it.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}

      {plan.precautions?.length ? (
        <Card className="rounded-2xl border-amber-300/40 bg-amber-50/40 dark:bg-amber-950/10">
          <CardHeader><CardTitle className="text-base">Precautions</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {plan.precautions.map((p: string, i: number) => <li key={i}>{p}</li>)}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link to={`/vaidya/yoga/progress?plan=${plan.id}`}>Log Progress →</Link>
        </Button>
      </div>
    </div>
  );
};

const Field = ({ label, children, className = "" }: any) => (
  <div className={`space-y-1.5 ${className}`}><Label className="text-xs">{label}</Label>{children}</div>
);

const AddItemDialog = ({
  section, kind, libs, onAdd,
}: {
  section: Section; kind: Kind; libs: any;
  onAdd: (s: Section, k: Kind, id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [refId, setRefId] = useState("");
  const list = kind === "asana" ? libs.asanas : kind === "pranayama" ? libs.pranayamas : libs.meditations;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add to {section}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label className="text-xs">Choose {kind}</Label>
          <Select value={refId} onValueChange={setRefId}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {list.map((x: any) => (
                <SelectItem key={x.id} value={x.id}>
                  {x.sanskrit_name ? `${x.sanskrit_name}${x.english_name ? ` – ${x.english_name}` : ""}` : x.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!refId} onClick={() => { onAdd(section, kind, refId); setOpen(false); setRefId(""); }}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default YogaPlanDetail;
