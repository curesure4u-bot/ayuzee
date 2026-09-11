import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertTriangle, ShieldCheck, Save, Lock } from "lucide-react";
import type { ChecklistTemplate } from "./spineChecklistTemplates";

interface SpineChecklistProps {
  template: ChecklistTemplate;
  /** compact = inline gate (no own save button); full = standalone with save */
  variant?: "full" | "gate";
  /** notify parent whenever clear-state changes (used by the session gate) */
  onClearChange?: (allClear: boolean) => void;
  /** prefill patient name from parent (session recorder) */
  patientName?: string;
  /** hide the internal save button (parent saves) */
  hideSave?: boolean;
}

/**
 * Reusable Spine AYUSH checklist / SOP renderer.
 * - Groups items by category
 * - Tracks required-item completion %
 * - Detects red-flag items (checking one = danger present → blocks "all clear")
 * - Saves a completion record to the spine_checklists audit table
 */
export default function SpineChecklist({
  template,
  variant = "full",
  onClearChange,
  patientName: patientNameProp,
  hideSave,
}: SpineChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [patientName, setPatientName] = useState(patientNameProp || "");
  const [performedBy, setPerformedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  const requiredIdx = useMemo(
    () => template.items.map((it, i) => (it.required ? i : -1)).filter((i) => i >= 0),
    [template],
  );
  const redFlagIdx = useMemo(
    () => template.items.map((it, i) => (it.redFlag ? i : -1)).filter((i) => i >= 0),
    [template],
  );

  const requiredDone = requiredIdx.filter((i) => checked.has(i)).length;
  const requiredTotal = requiredIdx.length;
  const pct = requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 100;

  const triggeredRedFlags = redFlagIdx.filter((i) => checked.has(i)).map((i) => template.items[i].label);
  const hasRedFlag = triggeredRedFlags.length > 0;

  // "All clear" = all required checked AND (if red-flag mode) no red flag triggered
  const allClear = requiredDone === requiredTotal && (!template.redFlagMode || !hasRedFlag);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      // notify parent after state settles
      queueMicrotask(() => {
        const reqDone = requiredIdx.filter((x) => n.has(x)).length;
        const rf = redFlagIdx.some((x) => n.has(x));
        const clear = reqDone === requiredTotal && (!template.redFlagMode || !rf);
        onClearChange?.(clear);
      });
      return n;
    });
  };

  // group items by category preserving order
  const groups = useMemo(() => {
    const map: { category: string; items: { it: (typeof template.items)[number]; idx: number }[] }[] = [];
    template.items.forEach((it, idx) => {
      let g = map.find((m) => m.category === it.category);
      if (!g) { g = { category: it.category, items: [] }; map.push(g); }
      g.items.push({ it, idx });
    });
    return map;
  }, [template]);

  const handleSave = async () => {
    if (template.needsPatient && !patientName.trim()) {
      toast.error("Enter patient name");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const itemsPayload = template.items.map((it, i) => ({
        label: it.label,
        category: it.category,
        required: !!it.required,
        redFlag: !!it.redFlag,
        checked: checked.has(i),
      }));
      const completedItems = template.items.filter((_, i) => checked.has(i)).length;
      const { error } = await (supabase.from("spine_checklists") as any).insert({
        owner_id: user?.id || null,
        checklist_type: template.type,
        checklist_title: template.title,
        patient_name: patientName.trim() || null,
        total_items: template.items.length,
        completed_items: completedItems,
        completion_pct: pct,
        all_clear: allClear,
        red_flags_triggered: triggeredRedFlags,
        items: itemsPayload,
        notes: notes.trim() || null,
        performed_by: performedBy.trim() || null,
      });
      if (error) { toast.error("Save failed: " + error.message); }
      else {
        setSavedOnce(true);
        toast.success(hasRedFlag ? "Recorded — RED FLAG noted, do not proceed" : "Checklist saved");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const catColor = (cat: string) =>
    cat.toLowerCase().includes("red flag")
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-muted text-muted-foreground";

  return (
    <Card className={variant === "gate" ? "border-amber-200" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="text-lg">{template.icon}</span> {template.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{template.purpose}</p>
          </div>
          {allClear ? (
            <Badge className="bg-green-100 text-green-700 shrink-0"><ShieldCheck className="h-3 w-3 mr-1" /> All Clear</Badge>
          ) : hasRedFlag ? (
            <Badge className="bg-red-100 text-red-700 shrink-0"><AlertTriangle className="h-3 w-3 mr-1" /> STOP — Red Flag</Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">{requiredDone}/{requiredTotal} required</Badge>
          )}
        </div>
        {requiredTotal > 0 && <Progress value={pct} className="h-1.5 mt-2" />}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Red-flag alert banner */}
        {hasRedFlag && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Do not proceed with treatment</p>
            <p className="text-xs mt-1">A danger sign is present. Refer the patient for medical evaluation. Record the finding below.</p>
            <ul className="mt-1 list-disc list-inside text-xs">
              {triggeredRedFlags.map((rf) => <li key={rf}>{rf}</li>)}
            </ul>
          </div>
        )}

        {/* Patient field */}
        {template.needsPatient && (
          <div>
            <label className="text-xs font-medium">Patient Name / ID</label>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Patient name" className="mt-1" />
          </div>
        )}

        {/* Grouped items */}
        {groups.map((g) => (
          <div key={g.category}>
            <div className="mb-1.5">
              <Badge variant="outline" className={`text-[10px] ${catColor(g.category)}`}>{g.category}</Badge>
            </div>
            <div className="space-y-1.5">
              {g.items.map(({ it, idx }) => {
                const isChecked = checked.has(idx);
                const danger = it.redFlag && isChecked;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggle(idx)}
                    className={`w-full flex items-start gap-2.5 rounded-md border p-2.5 text-left text-sm transition ${
                      danger
                        ? "border-red-300 bg-red-50"
                        : isChecked
                        ? "border-green-300 bg-green-50"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className={`mt-0.5 grid h-4 w-4 place-items-center rounded border shrink-0 ${
                      isChecked ? (danger ? "bg-red-500 border-red-500" : "bg-green-500 border-green-500") : "border-muted-foreground/40"
                    }`}>
                      {isChecked && (danger ? <AlertTriangle className="h-3 w-3 text-white" /> : <CheckCircle2 className="h-3 w-3 text-white" />)}
                    </span>
                    <span className="flex-1">
                      <span className={danger ? "text-red-800 font-medium" : ""}>
                        {it.label}
                        {it.required && <span className="text-red-500 ml-0.5">*</span>}
                      </span>
                      {it.help && <span className="block text-[11px] text-muted-foreground mt-0.5">{it.help}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Notes + performed-by + save (full variant only, or gate when not hidden) */}
        {!hideSave && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Performed by</label>
                <Input value={performedBy} onChange={(e) => setPerformedBy(e.target.value)} placeholder="Name / role" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Notes (optional)</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations, actions taken, referral made..." className="mt-1 h-16 text-sm" />
            </div>
            <Button
              className={`w-full gap-1 ${hasRedFlag ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={handleSave}
              disabled={saving}
            >
              {hasRedFlag ? <Lock className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : savedOnce ? "Save Again" : "Save Checklist Record"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
