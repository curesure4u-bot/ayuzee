import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Plan = {
  id: string; plan_name: string; plan_type: string; description: string | null;
  discount_percent: number; applicable_to: string; is_default: boolean; is_active: boolean;
};
type Item = {
  id: string; rate_plan_id: string; item_type: string; item_name: string; custom_price: number;
};

const TYPE_COLORS: Record<string, string> = {
  standard: "bg-slate-100 text-slate-800 border-slate-300",
  corporate: "bg-blue-100 text-blue-800 border-blue-300",
  insurance: "bg-purple-100 text-purple-800 border-purple-300",
  franchise: "bg-amber-100 text-amber-800 border-amber-300",
  concessional: "bg-green-100 text-green-800 border-green-300",
  vip: "bg-pink-100 text-pink-800 border-pink-300",
};

const empty = { id: "", plan_name: "", plan_type: "standard", description: "", discount_percent: 0, applicable_to: "all" };

const RatePlanMaster = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [items, setItems] = useState<Record<string, Item[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [itemOpen, setItemOpen] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ item_type: "procedure", item_name: "", custom_price: 0 });

  const load = async () => {
    const { data } = await supabase.from("hms_rate_plans").select("*").order("created_at");
    setPlans((data ?? []) as Plan[]);
  };
  const loadItems = async (planId: string) => {
    const { data } = await supabase.from("hms_rate_plan_items").select("*").eq("rate_plan_id", planId).order("item_type");
    setItems((m) => ({ ...m, [planId]: (data ?? []) as Item[] }));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.plan_name) { toast.error("Plan name required"); return; }
    const payload = { ...form, description: form.description || null };
    delete (payload as any).id;
    const q = form.id ? supabase.from("hms_rate_plans").update(payload).eq("id", form.id) : supabase.from("hms_rate_plans").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };

  const setDefault = async (id: string) => {
    await supabase.from("hms_rate_plans").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("hms_rate_plans").update({ is_default: true }).eq("id", id);
    toast.success("Default plan updated"); load();
  };

  const toggle = async (id: string, v: boolean) => {
    await supabase.from("hms_rate_plans").update({ is_active: v }).eq("id", id); load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this plan and all its overrides?")) return;
    await supabase.from("hms_rate_plans").delete().eq("id", id); load();
  };

  const addItem = async () => {
    if (!itemOpen || !itemForm.item_name) { toast.error("Item name required"); return; }
    const { error } = await supabase.from("hms_rate_plan_items").insert({ rate_plan_id: itemOpen, ...itemForm });
    if (error) { toast.error(error.message); return; }
    toast.success("Override added"); setItemForm({ item_type: "procedure", item_name: "", custom_price: 0 });
    loadItems(itemOpen);
  };
  const delItem = async (id: string, planId: string) => {
    await supabase.from("hms_rate_plan_items").delete().eq("id", id); loadItems(planId);
  };

  const toggleExpand = (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id); if (!items[id]) loadItems(id);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="💰 Rate Plan Master"
        description="Pricing plans for standard, corporate, insurance, franchise, and concessional patients."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Rate Plan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} rate plan</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Plan name</Label><Input value={form.plan_name} onChange={(e) => setForm({ ...form, plan_name: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.plan_type} onValueChange={(v) => setForm({ ...form, plan_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(TYPE_COLORS).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Discount %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} /></div>
                <div>
                  <Label>Applicable to</Label>
                  <Select value={form.applicable_to} onValueChange={(v) => setForm({ ...form, applicable_to: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="consultations">Consultations</SelectItem>
                      <SelectItem value="procedures">Procedures</SelectItem>
                      <SelectItem value="medicines">Medicines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <RadioGroup value={plans.find((p) => p.is_default)?.id ?? ""} onValueChange={setDefault} className="grid gap-3">
        {plans.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex flex-1 items-center gap-3">
                <button onClick={() => toggleExpand(p.id)} className="p-1">
                  {expanded === p.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{p.plan_name}</h3>
                    <Badge variant="outline" className={TYPE_COLORS[p.plan_type] || ""}>{p.plan_type}</Badge>
                    {p.is_default && <Badge className="bg-primary text-primary-foreground">Default</Badge>}
                    <Badge variant="secondary">{p.discount_percent}% off</Badge>
                    <span className="text-xs text-muted-foreground">on {p.applicable_to}</span>
                  </div>
                  {p.description && <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <RadioGroupItem value={p.id} id={`def-${p.id}`} /> Default
                </label>
                <Switch checked={p.is_active} onCheckedChange={(v) => toggle(p.id, v)} />
                <Button size="icon" variant="ghost" onClick={() => { setForm({ ...p, description: p.description ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>

            {expanded === p.id && (
              <div className="border-t bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Item-level price overrides</h4>
                  <Button size="sm" variant="outline" onClick={() => setItemOpen(itemOpen === p.id ? null : p.id)}>
                    <Plus className="mr-2 h-3 w-3" />Add Item Override
                  </Button>
                </div>
                {itemOpen === p.id && (
                  <div className="mb-3 grid gap-2 rounded-md border bg-background p-3 sm:grid-cols-4">
                    <Select value={itemForm.item_type} onValueChange={(v) => setItemForm({ ...itemForm, item_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="procedure">Procedure</SelectItem>
                        <SelectItem value="medicine">Medicine</SelectItem>
                        <SelectItem value="package">Package</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Item name" value={itemForm.item_name} onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })} />
                    <Input type="number" placeholder="Custom price (₹)" value={itemForm.custom_price} onChange={(e) => setItemForm({ ...itemForm, custom_price: Number(e.target.value) })} />
                    <Button size="sm" onClick={addItem}>Save Override</Button>
                  </div>
                )}
                <div className="grid gap-2">
                  {(items[p.id] ?? []).map((it) => (
                    <div key={it.id} className="flex items-center justify-between rounded-md border bg-background p-2 text-sm">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{it.item_type}</Badge>
                        <span>{it.item_name}</span>
                        <span className="font-mono text-muted-foreground">₹{Number(it.custom_price).toLocaleString()}</span>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => delItem(it.id, p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  {(items[p.id]?.length ?? 0) === 0 && <p className="text-xs text-muted-foreground">No overrides — patients pay base price minus {p.discount_percent}%.</p>}
                </div>
              </div>
            )}
          </Card>
        ))}
        {plans.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No rate plans yet.</p>}
      </RadioGroup>
    </div>
  );
};

export default RatePlanMaster;
