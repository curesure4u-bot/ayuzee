import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Source = { id: string; source_name: string; is_active: boolean };
type Proof = { id: string; proof_name: string; is_active: boolean; sort_order: number };
type Plan = { id: string; plan_name: string; description: string | null; discount_percent: number; validity_days: number; price: number; is_active: boolean };

function SimpleCrud<T extends { id: string; is_active: boolean }>({
  table, label, fields, rows, reload,
}: {
  table: string; label: string;
  fields: { key: keyof T; label: string; type?: string }[];
  rows: T[]; reload: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, any>>({});

  const add = async () => {
    if (!draft[fields[0].key as string]) return toast.error("Required");
    const { error } = await supabase.from(table as any).insert({ ...draft, is_active: true });
    if (error) return toast.error(error.message);
    setDraft({}); reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from(table as any).delete().eq("id", id); reload();
  };
  const toggle = async (id: string, v: boolean) => {
    await supabase.from(table as any).update({ is_active: v }).eq("id", id); reload();
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-end gap-2">
        {fields.map((f) => (
          <div key={f.key as string}>
            <label className="text-xs text-muted-foreground">{f.label}</label>
            <Input type={f.type || "text"} value={draft[f.key as string] ?? ""}
              onChange={(e) => setDraft({ ...draft, [f.key as string]: f.type === "number" ? Number(e.target.value) : e.target.value })} />
          </div>
        ))}
        <Button onClick={add}><Plus className="mr-1 h-4 w-4" />Add {label}</Button>
      </div>
      <div className="space-y-1">
        {rows.length === 0 && <p className="text-center text-sm text-muted-foreground p-4">No entries.</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded border bg-muted/30 px-3 py-2 text-sm">
            <div className="flex flex-wrap gap-3">
              {fields.map((f) => <span key={f.key as string}>{String((r as any)[f.key]) || "—"}</span>)}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} />
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function PatientMaster() {
  const [sources, setSources] = useState<Source[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const load = async () => {
    const [s, p, pl] = await Promise.all([
      supabase.from("hms_patient_sources").select("*").order("source_name"),
      supabase.from("hms_id_proof_types").select("*").order("sort_order"),
      supabase.from("hms_membership_plans").select("*").order("plan_name"),
    ]);
    setSources((s.data as any) ?? []);
    setProofs((p.data as any) ?? []);
    setPlans((pl.data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <HmsMasterHeader title="🧾 Patient Config" description="Patient sources, ID proofs and membership/loyalty plans." />
      <Tabs defaultValue="sources">
        <TabsList>
          <TabsTrigger value="sources">Patient Sources</TabsTrigger>
          <TabsTrigger value="proofs">ID Proof Types</TabsTrigger>
          <TabsTrigger value="plans">Membership Plans</TabsTrigger>
        </TabsList>
        <TabsContent value="sources" className="mt-4">
          <SimpleCrud<Source> table="hms_patient_sources" label="Source"
            fields={[{ key: "source_name", label: "Name" }]}
            rows={sources} reload={load} />
        </TabsContent>
        <TabsContent value="proofs" className="mt-4">
          <SimpleCrud<Proof> table="hms_id_proof_types" label="Proof"
            fields={[{ key: "proof_name", label: "Name" }, { key: "sort_order", label: "Order", type: "number" }]}
            rows={proofs} reload={load} />
        </TabsContent>
        <TabsContent value="plans" className="mt-4">
          <SimpleCrud<Plan> table="hms_membership_plans" label="Plan"
            fields={[
              { key: "plan_name", label: "Name" },
              { key: "price", label: "Price (₹)", type: "number" },
              { key: "validity_days", label: "Validity (days)", type: "number" },
              { key: "discount_percent", label: "Discount %", type: "number" },
              { key: "description", label: "Description" },
            ]}
            rows={plans} reload={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
