/**
 * AI Prescription Draft — clinician-in-the-loop workflow.
 *
 * Flow:
 *   1. Doctor enters diagnosis + history summary (auto-prefilled from record when available).
 *   2. Click "Generate draft" → ai-gateway (feature "prescription_draft") returns structured JSON.
 *   3. Draft row is INSERTed immutably into `ai_prescription_drafts` for audit.
 *   4. Doctor edits every field freely (line items + notes).
 *   5. Doctor MUST check the "Approved by Dr. X" box → INSERT into `ai_prescription_approved`.
 *      A DB trigger marks the draft as approved and links approved_prescription_id.
 *      A diff of the doctor's edits vs the AI draft is stored in `diff_from_draft`.
 *
 * The AI never writes an approved prescription. `approved_by_checkbox = true` is CHECK-enforced.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, ShieldCheck, Trash2, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export type AyushSystem = "ayurveda" | "homeopathy" | "siddha" | "unani" | "yoga_naturopathy";

export type PrescriptionItem = {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
  instructions: string;
};

const EMPTY_ITEM: PrescriptionItem = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  timing: "",
  instructions: "",
};

const SYSTEM_LABEL: Record<AyushSystem, string> = {
  ayurveda: "Ayurveda",
  homeopathy: "Homeopathy",
  siddha: "Siddha",
  unani: "Unani",
  yoga_naturopathy: "Yoga & Naturopathy",
};

export interface AiPrescriptionDraftDialogProps {
  ayushSystem: AyushSystem;
  /** Loose polymorphic ref — the source record this prescription attaches to. */
  patientRecordTable: string;
  patientRecordId: string;
  /** Optional patient user id (when the patient has an auth account). */
  patientUserId?: string | null;
  /** Optional consultation id if we're inside a consultation flow. */
  consultationId?: string | null;
  /** Optional prefill from an existing record. */
  initialDiagnosis?: string;
  initialHistorySummary?: string;
  /** Cosmetic — patient name for the dialog header. */
  patientDisplayName?: string;
  /** Optional trigger override. Defaults to a small "Draft prescription with AI" button. */
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
  triggerSize?: "default" | "sm" | "lg";
  triggerClassName?: string;
  onApproved?: (approvedId: string) => void;
}

type DraftRow = {
  id: string;
  ai_response_structured: {
    items?: PrescriptionItem[];
    notes?: string;
    safety_flags?: string[];
  };
};

function buildSystemPrompt(system: AyushSystem) {
  const label = SYSTEM_LABEL[system];
  return [
    `You are an AYUSH clinical drafting assistant for a licensed ${label} physician.`,
    "You NEVER finalize prescriptions. You produce a structured DRAFT the doctor will review, edit and sign off.",
    "Ground suggestions in classical ${label} principles and modern evidence where relevant.",
    "Flag red-flag symptoms, drug/herb interactions, pregnancy/pediatric concerns, and known contraindications in `safety_flags`.",
    "Return STRICT JSON only. No prose outside the JSON. Schema:",
    `{
  "items": [
    {
      "medicine": "string (formulation or classical drug name)",
      "dosage": "string (e.g. 1 tab, 5 ml, 30C)",
      "frequency": "string (e.g. BD, TID, once daily)",
      "duration": "string (e.g. 7 days, 2 weeks)",
      "timing": "string (e.g. before food with warm water)",
      "instructions": "string (rationale, cautions, anupana)"
    }
  ],
  "notes": "string (overall clinical reasoning, lifestyle/pathya-apathya, follow-up plan)",
  "safety_flags": ["short warning strings"]
}`,
    "If information is insufficient for a safe draft, return an empty items array and put the reason in `notes`.",
  ].join("\n");
}

function tryParseAiJson(text: string): DraftRow["ai_response_structured"] {
  if (!text) return {};
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      items: Array.isArray(parsed?.items)
        ? parsed.items.map((it: any) => ({ ...EMPTY_ITEM, ...it })).slice(0, 20)
        : [],
      notes: typeof parsed?.notes === "string" ? parsed.notes : "",
      safety_flags: Array.isArray(parsed?.safety_flags) ? parsed.safety_flags.slice(0, 20) : [],
    };
  } catch {
    // If the model returned prose, keep it as notes so the doctor can still work with it.
    return { items: [], notes: text, safety_flags: [] };
  }
}

function itemsDiff(before: PrescriptionItem[], after: PrescriptionItem[]) {
  const changes: Array<{ index: number; field: keyof PrescriptionItem; from: string; to: string }> = [];
  const max = Math.max(before.length, after.length);
  for (let i = 0; i < max; i++) {
    const b = before[i] ?? EMPTY_ITEM;
    const a = after[i] ?? EMPTY_ITEM;
    (Object.keys(EMPTY_ITEM) as Array<keyof PrescriptionItem>).forEach((k) => {
      if ((b[k] ?? "") !== (a[k] ?? "")) {
        changes.push({ index: i, field: k, from: b[k] ?? "", to: a[k] ?? "" });
      }
    });
  }
  return changes;
}

export function AiPrescriptionDraftDialog(props: AiPrescriptionDraftDialogProps) {
  const {
    ayushSystem,
    patientRecordTable,
    patientRecordId,
    patientUserId = null,
    consultationId = null,
    initialDiagnosis = "",
    initialHistorySummary = "",
    patientDisplayName,
    triggerLabel = "Draft prescription with AI",
    triggerVariant = "outline",
    triggerSize = "sm",
    triggerClassName,
    onApproved,
  } = props;

  const { doctor, userId } = useDoctor();
  const [open, setOpen] = useState(false);

  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [history, setHistory] = useState(initialHistorySummary);
  const [system, setSystem] = useState<AyushSystem>(ayushSystem);

  const [draft, setDraft] = useState<DraftRow | null>(null);
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [finalNotes, setFinalNotes] = useState("");
  const [safetyFlags, setSafetyFlags] = useState<string[]>([]);

  const [approved, setApproved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDiagnosis(initialDiagnosis);
    setHistory(initialHistorySummary);
    setSystem(ayushSystem);
    setDraft(null);
    setItems([]);
    setFinalNotes("");
    setSafetyFlags([]);
    setApproved(false);
  }, [open, initialDiagnosis, initialHistorySummary, ayushSystem]);

  const doctorName = useMemo(() => {
    const d: any = doctor ?? {};
    return d.full_name || d.name || d.display_name || d.doctor_name || "Doctor";
  }, [doctor]);

  const generate = async () => {
    if (!userId) return toast.error("Please sign in.");
    if (!diagnosis.trim()) return toast.error("Diagnosis / clinical notes are required.");
    setGenerating(true);
    try {
      const prompt = [
        `AYUSH system: ${SYSTEM_LABEL[system]}`,
        `Diagnosis / clinical notes:\n${diagnosis.trim()}`,
        history.trim() ? `Patient history summary:\n${history.trim()}` : "",
        patientDisplayName ? `Patient: ${patientDisplayName}` : "",
        "Return a STRICT JSON prescription draft matching the schema in the system prompt.",
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "prescription_draft",
          system: buildSystemPrompt(system),
          prompt,
          max_tokens: 1800,
        },
      });
      if (error) throw error;
      const responseText = (data as any)?.response ?? "";
      const usage = (data as any)?.usage ?? {};
      const structured = tryParseAiJson(responseText);

      // Persist immutable draft row for audit.
      const insertPayload = {
        doctor_user_id: userId,
        patient_user_id: patientUserId,
        patient_record_table: patientRecordTable,
        patient_record_id: patientRecordId,
        consultation_id: consultationId,
        ayush_system: system,
        input_diagnosis: diagnosis.trim(),
        input_history_summary: history.trim() || null,
        input_payload: { patient_display_name: patientDisplayName ?? null },
        ai_response_raw: responseText,
        ai_response_structured: structured as any,
        model: usage?.model ?? null,
        tokens_used: usage,
        status: "draft" as const,
      };
      const { data: draftRow, error: draftErr } = await (supabase as any)
        .from("ai_prescription_drafts")
        .insert(insertPayload)
        .select("id, ai_response_structured")
        .single();
      if (draftErr) throw draftErr;

      setDraft({ id: draftRow.id, ai_response_structured: structured });
      setItems(
        (structured.items && structured.items.length ? structured.items : [{ ...EMPTY_ITEM }]).map((i) => ({
          ...EMPTY_ITEM,
          ...i,
        })),
      );
      setFinalNotes(structured.notes ?? "");
      setSafetyFlags(structured.safety_flags ?? []);
      toast.success("Draft generated. Review and edit before approval.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to generate draft");
    } finally {
      setGenerating(false);
    }
  };

  const updateItem = (idx: number, field: keyof PrescriptionItem, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const approve = async () => {
    if (!draft || !userId) return;
    if (!approved) return toast.error("You must check the approval box.");
    if (items.every((it) => !it.medicine.trim())) return toast.error("Add at least one medicine before approving.");

    setSaving(true);
    try {
      const cleanItems = items.filter((it) => it.medicine.trim());
      const originalItems = draft.ai_response_structured.items ?? [];
      const diff = {
        item_changes: itemsDiff(originalItems, cleanItems),
        notes_changed: (draft.ai_response_structured.notes ?? "") !== finalNotes,
        items_added: Math.max(0, cleanItems.length - originalItems.length),
        items_removed: Math.max(0, originalItems.length - cleanItems.length),
      };

      const { data: approvedRow, error: approveErr } = await (supabase as any)
        .from("ai_prescription_approved")
        .insert({
          draft_id: draft.id,
          doctor_user_id: userId,
          doctor_name_snapshot: doctorName,
          patient_user_id: patientUserId,
          patient_record_table: patientRecordTable,
          patient_record_id: patientRecordId,
          consultation_id: consultationId,
          ayush_system: system,
          final_items: cleanItems as any,
          final_notes: finalNotes || null,
          diff_from_draft: diff as any,
          approved_by_checkbox: true,
          approved_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (approveErr) throw approveErr;

      toast.success("Prescription approved and saved to patient record.");
      onApproved?.(approvedRow.id);
      setOpen(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to save approved prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={triggerSize} variant={triggerVariant} className={triggerClassName} type="button">
          <Sparkles className="mr-1 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Prescription Draft
            <Badge variant="outline" className="ml-1">{SYSTEM_LABEL[system]}</Badge>
          </DialogTitle>
          <DialogDescription>
            {patientDisplayName ? `For ${patientDisplayName}. ` : ""}
            AI produces a draft only — every field is editable and a clinician sign-off is required before it is saved to the patient record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Inputs */}
          <Card className="p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-[1fr_200px]">
              <div>
                <Label>Diagnosis / clinical notes *</Label>
                <Textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Amavata (rheumatoid) — chronic joint pain, morning stiffness…"
                />
              </div>
              <div>
                <Label>AYUSH system</Label>
                <Select value={system} onValueChange={(v) => setSystem(v as AyushSystem)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SYSTEM_LABEL) as AyushSystem[]).map((k) => (
                      <SelectItem key={k} value={k}>{SYSTEM_LABEL[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Patient history summary (optional)</Label>
              <Textarea
                rows={2}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder="Relevant past history, allergies, current medications, comorbidities…"
              />
            </div>
            <Button type="button" onClick={generate} disabled={generating || !diagnosis.trim()}>
              {generating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
              {draft ? "Regenerate draft" : "Generate draft"}
            </Button>
          </Card>

          {/* Draft output */}
          {draft && (
            <>
              {safetyFlags.length > 0 && (
                <Card className="p-3 border-amber-500/50 bg-amber-500/10">
                  <p className="text-xs font-semibold flex items-center gap-1 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="h-3 w-3" /> Safety flags
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-xs space-y-0.5">
                    {safetyFlags.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </Card>
              )}

              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Prescription items (editable)</p>
                  <Button size="sm" variant="ghost" type="button" onClick={addItem}>
                    <Plus className="mr-1 h-3 w-3" /> Add item
                  </Button>
                </div>
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground">No items yet — add one manually.</p>
                )}
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={idx} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Item {idx + 1}</p>
                        <Button size="sm" variant="ghost" type="button" onClick={() => removeItem(idx)}>
                          <Trash2 className="h-3 w-3 text-rose-500" />
                        </Button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <Label className="text-xs">Medicine</Label>
                          <Input value={it.medicine} onChange={(e) => updateItem(idx, "medicine", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Dosage</Label>
                          <Input value={it.dosage} onChange={(e) => updateItem(idx, "dosage", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Frequency</Label>
                          <Input value={it.frequency} onChange={(e) => updateItem(idx, "frequency", e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Duration</Label>
                          <Input value={it.duration} onChange={(e) => updateItem(idx, "duration", e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Timing / anupana</Label>
                          <Input value={it.timing} onChange={(e) => updateItem(idx, "timing", e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Instructions</Label>
                          <Textarea rows={2} value={it.instructions} onChange={(e) => updateItem(idx, "instructions", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label>Notes / reasoning / lifestyle advice</Label>
                  <Textarea rows={4} value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)} />
                </div>
              </Card>

              {/* Approval */}
              <Card className="p-4 border-primary/40 bg-primary/5 space-y-3">
                <p className="text-sm font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Clinician sign-off (required)
                </p>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={approved}
                    onCheckedChange={(v) => setApproved(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    I, <strong>Dr. {doctorName}</strong>, have reviewed the AI-generated draft, edited it as required, and take clinical responsibility for this prescription.
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Approved at: {new Date().toLocaleString()}. The original AI draft and this approved version are both stored for audit — nothing is overwritten.
                </p>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="button" onClick={approve} disabled={!draft || !approved || saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1 h-4 w-4" />}
            Approve & save to record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AiPrescriptionDraftDialog;
