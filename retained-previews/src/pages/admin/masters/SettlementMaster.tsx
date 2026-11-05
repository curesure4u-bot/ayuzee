import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

const TYPE_COLORS: Record<string, string> = {
  insurance_tpa: "bg-purple-100 text-purple-800 border-purple-300",
  corporate: "bg-blue-100 text-blue-800 border-blue-300",
  franchise: "bg-amber-100 text-amber-800 border-amber-300",
};
const empty = { id: "", rule_name: "", settlement_type: "insurance_tpa", partner_name: "", contact_person: "", contact_phone: "", contact_email: "", credit_period_days: 30, settlement_day_of_month: 5, discount_percent: 0, notes: "" };

const SettlementMaster = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const load = async () => { const { data } = await supabase.from("hms_settlement_rules").select("*").order("rule_name"); setRows(data ?? []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.rule_name) return toast.error("Rule name required");
    const p: any = { ...form }; delete p.id;
    const { error } = form.id ? await supabase.from("hms_settlement_rules").update(p).eq("id", form.id) : await supabase.from("hms_settlement_rules").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="🤝 Settlement Master"
        description="Payment terms for insurance/TPA, corporate, and franchise partners."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Settlement Rule</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} settlement rule</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Rule name</Label><Input value={form.rule_name} onChange={(e) => setForm({ ...form, rule_name: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.settlement_type} onValueChange={(v) => setForm({ ...form, settlement_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insurance_tpa">Insurance / TPA</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="franchise">Franchise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Partner name</Label><Input value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Contact person</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
                </div>
                <div><Label>Email</Label><Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Credit period (days)</Label><Input type="number" value={form.credit_period_days} onChange={(e) => setForm({ ...form, credit_period_days: Number(e.target.value) })} /></div>
                  <div><Label>Settle on day</Label><Input type="number" min={1} max={31} value={form.settlement_day_of_month} onChange={(e) => setForm({ ...form, settlement_day_of_month: Number(e.target.value) })} /></div>
                  <div><Label>Discount %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.rule_name}</h3>
                  <Badge variant="outline" className={TYPE_COLORS[r.settlement_type] || ""}>{r.settlement_type.replace("_", " ")}</Badge>
                  <Badge variant="secondary">{r.credit_period_days}d credit</Badge>
                  <Badge variant="secondary">Settle on {r.settlement_day_of_month}</Badge>
                  {r.discount_percent > 0 && <Badge>{r.discount_percent}% off</Badge>}
                </div>
                {r.partner_name && <p className="mt-1 text-sm">{r.partner_name} {r.contact_person && `· ${r.contact_person}`} {r.contact_phone && `· ${r.contact_phone}`}</p>}
                {r.notes && <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline"><Send className="mr-2 h-3 w-3" />Raise Settlement</Button>
                <Switch checked={r.is_active} onCheckedChange={async (v) => { await supabase.from("hms_settlement_rules").update({ is_active: v }).eq("id", r.id); load(); }} />
                <Button size="icon" variant="ghost" onClick={() => { setForm({ ...r, notes: r.notes ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("hms_settlement_rules").delete().eq("id", r.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No settlement rules.</p>}
      </div>
    </div>
  );
};

export default SettlementMaster;
