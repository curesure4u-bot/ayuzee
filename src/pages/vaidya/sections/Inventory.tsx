import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Boxes, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Inventory = () => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ medicine_name: "", brand: "", batch_no: "", quantity: "", purchase_price: "", mrp: "", expiry_date: "", low_stock_threshold: "5" });

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase.from("vaidya_inventory").select("*").eq("doctor_user_id", userId).order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const submit = async () => {
    if (!userId) return;
    if (!form.medicine_name.trim()) return toast.error("Medicine name required");
    const { error } = await supabase.from("vaidya_inventory").insert({
      doctor_user_id: userId,
      medicine_name: form.medicine_name.trim(),
      brand: form.brand || null,
      batch_no: form.batch_no || null,
      quantity: Number(form.quantity || 0),
      purchase_price: Number(form.purchase_price || 0),
      mrp: Number(form.mrp || 0),
      expiry_date: form.expiry_date || null,
      low_stock_threshold: Number(form.low_stock_threshold || 5),
    });
    if (error) return toast.error(error.message);
    toast.success("Stock added");
    setOpen(false);
    setForm({ medicine_name: "", brand: "", batch_no: "", quantity: "", purchase_price: "", mrp: "", expiry_date: "", low_stock_threshold: "5" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("vaidya_inventory").delete().eq("id", id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl">Inventory</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Add Stock</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add stock item</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label>Medicine name *</Label><Input value={form.medicine_name} onChange={(e) => setForm({ ...form, medicine_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Brand</Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
                  <div><Label>Batch no.</Label><Input value={form.batch_no} onChange={(e) => setForm({ ...form, batch_no: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Qty</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
                  <div><Label>Purchase ₹</Label><Input type="number" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} /></div>
                  <div><Label>MRP ₹</Label><Input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Expiry</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
                  <div><Label>Low-stock threshold</Label><Input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button onClick={submit}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <Boxes className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No stock yet.</p>
        </Card>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-2">Medicine</th>
                <th className="py-2 pr-2">Brand</th>
                <th className="py-2 pr-2">Batch</th>
                <th className="py-2 pr-2">Qty</th>
                <th className="py-2 pr-2">MRP</th>
                <th className="py-2 pr-2">Expiry</th>
                <th className="py-2 pr-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => {
                const low = s.quantity <= (s.low_stock_threshold ?? 5);
                return (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-3 pr-2 font-medium">{s.medicine_name}</td>
                    <td className="py-3 pr-2">{s.brand || "—"}</td>
                    <td className="py-3 pr-2">{s.batch_no || "—"}</td>
                    <td className="py-3 pr-2">
                      {s.quantity} {low && <Badge variant="destructive" className="ml-1">Low</Badge>}
                    </td>
                    <td className="py-3 pr-2">₹{s.mrp}</td>
                    <td className="py-3 pr-2 text-xs">{s.expiry_date || "—"}</td>
                    <td className="py-3 pr-2"><Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Inventory;
