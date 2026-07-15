import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CommissionRule } from "@/types/commission";

const tierSchema = z.object({
  min: z.coerce.number().min(0),
  max: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  percent: z.coerce.number().min(0).max(100),
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(100),
    description: z.string().max(500).optional().or(z.literal("")),
    rule_type: z.enum(["fixed", "percentage", "tiered"]),
    priority: z.coerce.number().int().min(0).max(1000),
    valid_from: z.string().min(1, "Required"),
    valid_until: z.string().optional().or(z.literal("")),
    applicable_type: z.enum(["all", "category", "manufacturer", "product"]),
    applicable_values: z.string().optional().or(z.literal("")),
    fixed_doctor: z.coerce.number().min(0).default(0),
    fixed_platform: z.coerce.number().min(0).default(0),
    fixed_logistics: z.coerce.number().min(0).default(0),
    pct_doctor: z.coerce.number().min(0).max(100).default(0),
    pct_platform: z.coerce.number().min(0).max(100).default(0),
    pct_manufacturer: z.coerce.number().min(0).max(100).default(0),
    tiers: z.array(tierSchema).default([]),
    min_order_value: z.coerce.number().min(0).optional().or(z.nan()),
    max_commission_cap: z.coerce.number().min(0).optional().or(z.nan()),
    first_purchase_only: z.boolean().default(false),
    doctor_experience: z.enum(["any", "beginner", "intermediate", "expert"]).default("any"),
  })
  .refine(
    (d) =>
      d.rule_type !== "percentage" ||
      Math.round(d.pct_doctor + d.pct_platform + d.pct_manufacturer) === 100,
    { message: "Percentage shares must total 100%", path: ["pct_manufacturer"] },
  )
  .refine((d) => d.rule_type !== "tiered" || d.tiers.length > 0, {
    message: "Add at least one tier",
    path: ["tiers"],
  });

type FormValues = z.infer<typeof schema>;

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: CommissionRule | null;
  onSubmit: (values: Omit<CommissionRule, "id" | "created_at" | "updated_at" | "created_by">) => Promise<void> | void;
}

const STEPS = ["Basics", "Applicability", "Breakdown", "Conditions"];

export const CommissionRuleForm = ({ open, onOpenChange, initial, onSubmit }: Props) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [sampleMrp, setSampleMrp] = useState(1000);

  const defaults = useMemo<FormValues>(() => {
    const b = initial?.commission_breakdown;
    return {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      rule_type: initial?.rule_type ?? "fixed",
      priority: initial?.priority ?? 10,
      valid_from: initial?.valid_from ?? new Date().toISOString().slice(0, 10),
      valid_until: initial?.valid_until ?? "",
      applicable_type: (initial?.applicable_to.type as FormValues["applicable_type"]) ?? "all",
      applicable_values: initial?.applicable_to.values?.join(", ") ?? "",
      fixed_doctor: b?.kind === "fixed" ? b.fixed.doctor : 0,
      fixed_platform: b?.kind === "fixed" ? b.fixed.platform : 0,
      fixed_logistics: b?.kind === "fixed" ? b.fixed.logistics : 0,
      pct_doctor: b?.kind === "percentage" ? b.percentage.doctor : 0,
      pct_platform: b?.kind === "percentage" ? b.percentage.platform : 0,
      pct_manufacturer: b?.kind === "percentage" ? b.percentage.manufacturer : 0,
      tiers:
        b?.kind === "tiered"
          ? b.tiers.map((t) => ({ min: t.min, max: t.max ?? "", percent: t.percent }))
          : [],
      min_order_value: initial?.conditions.min_order_value ?? undefined,
      max_commission_cap: initial?.conditions.max_commission_cap ?? undefined,
      first_purchase_only: initial?.conditions.first_purchase_only ?? false,
      doctor_experience: initial?.conditions.doctor_experience ?? "any",
    };
  }, [initial]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaults);
      setStep(0);
    }
  }, [open, defaults, form]);

  const tiersFA = useFieldArray({ control: form.control, name: "tiers" });
  const ruleType = form.watch("rule_type");
  const applicableType = form.watch("applicable_type");
  const fixedTotal =
    Number(form.watch("fixed_doctor") || 0) +
    Number(form.watch("fixed_platform") || 0) +
    Number(form.watch("fixed_logistics") || 0);
  const pctTotal =
    Number(form.watch("pct_doctor") || 0) +
    Number(form.watch("pct_platform") || 0) +
    Number(form.watch("pct_manufacturer") || 0);

  const previewData = useMemo(() => {
    if (ruleType === "fixed") {
      const total = fixedTotal;
      return [
        { name: "Manufacturer", value: Math.max(sampleMrp - total, 0) },
        { name: "Doctor", value: Number(form.getValues("fixed_doctor") || 0) },
        { name: "Platform", value: Number(form.getValues("fixed_platform") || 0) },
        { name: "Logistics", value: Number(form.getValues("fixed_logistics") || 0) },
      ];
    }
    if (ruleType === "percentage") {
      return [
        { name: "Manufacturer", value: (sampleMrp * Number(form.getValues("pct_manufacturer") || 0)) / 100 },
        { name: "Doctor", value: (sampleMrp * Number(form.getValues("pct_doctor") || 0)) / 100 },
        { name: "Platform", value: (sampleMrp * Number(form.getValues("pct_platform") || 0)) / 100 },
      ];
    }
    const tiers = form.getValues("tiers");
    const t = tiers.find((x) => sampleMrp >= Number(x.min) && (x.max === "" || x.max == null || sampleMrp <= Number(x.max)));
    const c = t ? (sampleMrp * Number(t.percent)) / 100 : 0;
    return [
      { name: "Manufacturer", value: sampleMrp - c },
      { name: "Commission", value: c },
    ];
  }, [ruleType, fixedTotal, sampleMrp, form]);

  const handleSubmit = form.handleSubmit(async (v) => {
    setSubmitting(true);
    try {
      const breakdown =
        v.rule_type === "fixed"
          ? { kind: "fixed" as const, fixed: { doctor: v.fixed_doctor, platform: v.fixed_platform, logistics: v.fixed_logistics } }
          : v.rule_type === "percentage"
          ? { kind: "percentage" as const, percentage: { doctor: v.pct_doctor, platform: v.pct_platform, manufacturer: v.pct_manufacturer } }
          : {
              kind: "tiered" as const,
              tiers: v.tiers.map((t) => ({ min: Number(t.min), max: t.max === "" || t.max == null ? null : Number(t.max), percent: Number(t.percent) })),
            };
      await onSubmit({
        name: v.name,
        description: v.description || null,
        rule_type: v.rule_type,
        applicable_to: {
          type: v.applicable_type,
          values: v.applicable_values
            ? v.applicable_values.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        },
        commission_breakdown: breakdown,
        conditions: {
          min_order_value: Number.isFinite(Number(v.min_order_value)) ? Number(v.min_order_value) : null,
          max_commission_cap: Number.isFinite(Number(v.max_commission_cap)) ? Number(v.max_commission_cap) : null,
          first_purchase_only: v.first_purchase_only,
          doctor_experience: v.doctor_experience,
        },
        priority: v.priority,
        is_active: initial?.is_active ?? true,
        valid_from: v.valid_from,
        valid_until: v.valid_until || null,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  });

  const next = async () => {
    const fields: Record<number, (keyof FormValues)[]> = {
      0: ["name", "rule_type", "priority", "valid_from"],
      1: ["applicable_type"],
      2:
        ruleType === "fixed"
          ? ["fixed_doctor", "fixed_platform", "fixed_logistics"]
          : ruleType === "percentage"
          ? ["pct_doctor", "pct_platform", "pct_manufacturer"]
          : ["tiers"],
      3: [],
    };
    const ok = await form.trigger(fields[step] as any);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Commission Rule" : "New Commission Rule"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <div className="grid gap-4">
              <div>
                <Label>Rule name *</Label>
                <Input {...form.register("name")} placeholder="Default Doctor Commission" />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...form.register("description")} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rule type</Label>
                  <Select value={form.watch("rule_type")} onValueChange={(v) => form.setValue("rule_type", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority (higher wins)</Label>
                  <Input type="number" {...form.register("priority")} />
                </div>
                <div>
                  <Label>Valid from *</Label>
                  <Input type="date" {...form.register("valid_from")} />
                </div>
                <div>
                  <Label>Valid until</Label>
                  <Input type="date" {...form.register("valid_until")} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Label>Apply to</Label>
              <RadioGroup
                value={applicableType}
                onValueChange={(v) => form.setValue("applicable_type", v as any)}
                className="grid grid-cols-2 gap-2"
              >
                {[
                  ["all", "All products"],
                  ["category", "Specific category"],
                  ["manufacturer", "Specific manufacturers"],
                  ["product", "Specific products"],
                ].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 rounded-md border p-3 cursor-pointer">
                    <RadioGroupItem value={v} /> {l}
                  </label>
                ))}
              </RadioGroup>
              {applicableType !== "all" && (
                <div>
                  <Label>{applicableType === "category" ? "Category names" : applicableType === "manufacturer" ? "Manufacturer IDs" : "Product IDs"} (comma separated)</Label>
                  <Textarea {...form.register("applicable_values")} placeholder="e.g. classical, churnas" />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {ruleType === "fixed" && (
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Doctor referral ₹</Label><Input type="number" {...form.register("fixed_doctor")} /></div>
                    <div><Label>Platform fee ₹</Label><Input type="number" {...form.register("fixed_platform")} /></div>
                    <div><Label>Logistics ₹</Label><Input type="number" {...form.register("fixed_logistics")} /></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total commission: ₹{fixedTotal}{fixedTotal > sampleMrp && <span className="ml-2 text-destructive">⚠ Exceeds sample MRP ₹{sampleMrp}</span>}
                  </p>
                </div>
              )}
              {ruleType === "percentage" && (
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Doctor %</Label><Input type="number" {...form.register("pct_doctor")} /></div>
                    <div><Label>Platform %</Label><Input type="number" {...form.register("pct_platform")} /></div>
                    <div><Label>Manufacturer %</Label><Input type="number" {...form.register("pct_manufacturer")} /></div>
                  </div>
                  <p className={`text-sm ${pctTotal === 100 ? "text-muted-foreground" : "text-destructive"}`}>Total: {pctTotal}% (must equal 100%)</p>
                </div>
              )}
              {ruleType === "tiered" && (
                <div className="space-y-2">
                  {tiersFA.fields.map((f, i) => (
                    <div key={f.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                      <div><Label>Min ₹</Label><Input type="number" {...form.register(`tiers.${i}.min` as const)} /></div>
                      <div><Label>Max ₹ (blank=∞)</Label><Input type="number" {...form.register(`tiers.${i}.max` as const)} /></div>
                      <div><Label>Commission %</Label><Input type="number" {...form.register(`tiers.${i}.percent` as const)} /></div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => tiersFA.remove(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => tiersFA.append({ min: 0, max: "" as any, percent: 10 })}>
                    <Plus className="h-4 w-4" /> Add tier
                  </Button>
                  {form.formState.errors.tiers && <p className="text-xs text-destructive">{(form.formState.errors.tiers as any).message}</p>}
                </div>
              )}

              <div className="rounded-md border p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs">Live preview</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Sample MRP</span>
                    <Input type="number" value={sampleMrp} onChange={(e) => setSampleMrp(Number(e.target.value) || 0)} className="h-8 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_140px] gap-3">
                  <div className="space-y-1 text-sm">
                    {previewData.map((p) => (
                      <div key={p.name} className="flex justify-between">
                        <span className="text-muted-foreground">{p.name}</span>
                        <span className="font-mono">₹{Math.round(p.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={previewData} dataKey="value" nameKey="name" innerRadius={26} outerRadius={50}>
                          {previewData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => `₹${Math.round(v)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Minimum order value ₹</Label><Input type="number" {...form.register("min_order_value")} /></div>
                <div><Label>Max commission cap ₹</Label><Input type="number" {...form.register("max_commission_cap")} /></div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="fpo">Applies only to first purchase</Label>
                <Switch id="fpo" checked={form.watch("first_purchase_only")} onCheckedChange={(v) => form.setValue("first_purchase_only", v)} />
              </div>
              <div>
                <Label>Doctor experience filter</Label>
                <Select value={form.watch("doctor_experience")} onValueChange={(v) => form.setValue("doctor_experience", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next}>Next</Button>
            ) : (
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : initial ? "Update Rule" : "Create Rule"}</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
