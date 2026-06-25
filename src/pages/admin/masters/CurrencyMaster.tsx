import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type C = {
  id: string;
  currency_name: string;
  currency_code: string;
  symbol: string;
  exchange_rate_to_inr: number;
  is_default: boolean;
  is_active: boolean;
  updated_at: string;
};

export default function CurrencyMaster() {
  const [rows, setRows] = useState<C[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ currency_name: "", currency_code: "", symbol: "", exchange_rate_to_inr: 1 });

  const load = async () => {
    const { data } = await supabase.from("hms_currencies").select("*").order("currency_code");
    setRows((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<C>) => {
    const { error } = await supabase.from("hms_currencies").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  };
  const setDefault = async (id: string) => {
    await supabase.from("hms_currencies").update({ is_default: false }).neq("id", id);
    await supabase.from("hms_currencies").update({ is_default: true }).eq("id", id);
    toast.success("Default set"); load();
  };
  const add = async () => {
    if (!form.currency_name || !form.currency_code) return toast.error("Required");
    const { error } = await supabase.from("hms_currencies").insert(form);
    if (error) return toast.error(error.message);
    setAdding(false); setForm({ currency_name: "", currency_code: "", symbol: "", exchange_rate_to_inr: 1 });
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("hms_currencies").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <HmsMasterHeader title="💱 Currency Master" description="Multi-currency setup. All internal accounting stays in INR."
        actions={<Button onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Add Currency</Button>} />

      <Card className="p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Note: All internal accounting stays in INR. Secondary currency shows approximate equivalent on bills.
        </p>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Symbol</TableHead><TableHead>Rate → INR</TableHead><TableHead>Default</TableHead><TableHead>Active</TableHead><TableHead>Last Updated</TableHead><TableHead></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {adding && (
              <TableRow>
                <TableCell><Input value={form.currency_code} onChange={(e) => setForm({ ...form, currency_code: e.target.value.toUpperCase() })} /></TableCell>
                <TableCell><Input value={form.currency_name} onChange={(e) => setForm({ ...form, currency_name: e.target.value })} /></TableCell>
                <TableCell><Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} /></TableCell>
                <TableCell><Input type="number" step="0.01" value={form.exchange_rate_to_inr} onChange={(e) => setForm({ ...form, exchange_rate_to_inr: Number(e.target.value) })} /></TableCell>
                <TableCell colSpan={3}></TableCell>
                <TableCell><Button size="sm" onClick={add}>Save</Button></TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-semibold">{r.currency_code}</TableCell>
                <TableCell>{r.currency_name}</TableCell>
                <TableCell>{r.symbol}</TableCell>
                <TableCell><Input type="number" step="0.01" className="h-8 w-24" defaultValue={r.exchange_rate_to_inr} onBlur={(e) => Number(e.target.value) !== r.exchange_rate_to_inr && update(r.id, { exchange_rate_to_inr: Number(e.target.value) })} /></TableCell>
                <TableCell><input type="radio" checked={r.is_default} onChange={() => setDefault(r.id)} /></TableCell>
                <TableCell><Switch checked={r.is_active} onCheckedChange={(c) => update(r.id, { is_active: c })} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
