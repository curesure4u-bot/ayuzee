import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ReceiptText, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AYUSH_THERAPIES } from "@/data/ayushTherapyCatalog";

interface Props { type: "patient_bill" | "direct_selling" }

interface LineForm { medicine_name: string; quantity: string; unit_price: string }

const BillsPage = ({ type }: Props) => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState({ name: "", phone: "" });
  const [lines, setLines] = useState<LineForm[]>([{ medicine_name: "", quantity: "1", unit_price: "0" }]);
  const [discount, setDiscount] = useState("0");

  const load = async () => {
    if (!userId) return;
    const [{ data: bills }, { data: inv }] = await Promise.all([
      supabase.from("vaidya_bills").select("*").eq("doctor_user_id", userId).eq("bill_type", type).order("created_at", { ascending: false }),
      supabase.from("vaidya_inventory").select("id, medicine_name, mrp, quantity").eq("doctor_user_id", userId),
    ]);
    setItems(bills ?? []);
    setStock(inv ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId, type]);

  const subtotal = lines.reduce((s, l) => s + Number(l.quantity || 0) * Number(l.unit_price || 0), 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  const submit = async () => {
    if (!userId) return;
    if (!patient.name.trim()) return toast.error("Patient name required");
    if (lines.length === 0) return toast.error("Add at least one line");
    const { data: bill, error } = await supabase
      .from("vaidya_bills")
      .insert({
        doctor_user_id: userId,
        patient_name: patient.name.trim(),
        patient_phone: patient.phone || null,
        bill_type: type,
        subtotal,
        discount: Number(discount || 0),
        total,
      })
      .select()
      .single();
    if (error || !bill) return toast.error(error?.message || "Failed");
    const itemsRows = lines
      .filter((l) => l.medicine_name.trim())
      .map((l) => ({
        bill_id: bill.id,
        medicine_name: l.medicine_name.trim(),
        quantity: Number(l.quantity || 1),
        unit_price: Number(l.unit_price || 0),
        line_total: Number(l.quantity || 1) * Number(l.unit_price || 0),
      }));
    if (itemsRows.length) {
      await supabase.from("vaidya_bill_items").insert(itemsRows);
      // decrement stock for matching items
      for (const l of lines) {
        const match = stock.find((s) => s.medicine_name.toLowerCase() === l.medicine_name.toLowerCase());
        if (match) {
          await supabase
            .from("vaidya_inventory")
            .update({ quantity: Math.max(0, (match.quantity ?? 0) - Number(l.quantity || 0)) })
            .eq("id", match.id);
        }
      }
    }
    toast.success("Bill saved");
    setOpen(false);
    setPatient({ name: "", phone: "" });
    setLines([{ medicine_name: "", quantity: "1", unit_price: "0" }]);
    setDiscount("0");
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl">{type === "patient_bill" ? "All Bills" : "Direct Selling"}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New {type === "patient_bill" ? "Bill" : "Sale"}</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>New {type === "patient_bill" ? "patient bill" : "direct sale"}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Patient name *</Label><Input value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Items</Label>
                  <div className="space-y-2">
                    {lines.map((l, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_70px_90px_auto] gap-2">
                        <Input placeholder="Medicine or therapy" list="bill-catalog" value={l.medicine_name} onChange={(e) => { const arr = [...lines]; arr[idx].medicine_name = e.target.value; const m = stock.find((s) => s.medicine_name.toLowerCase() === e.target.value.toLowerCase()); if (m) { arr[idx].unit_price = String(m.mrp); } else { const th = AYUSH_THERAPIES.find((t) => `${t.code} · ${t.name}`.toLowerCase() === e.target.value.toLowerCase() || t.name.toLowerCase() === e.target.value.toLowerCase()); if (th) arr[idx].unit_price = String(th.price); } setLines(arr); }} />
                        <Input type="number" placeholder="Qty" value={l.quantity} onChange={(e) => { const arr = [...lines]; arr[idx].quantity = e.target.value; setLines(arr); }} />
                        <Input type="number" placeholder="₹" value={l.unit_price} onChange={(e) => { const arr = [...lines]; arr[idx].unit_price = e.target.value; setLines(arr); }} />
                        <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                    <datalist id="bill-catalog">
                      {stock.map((s) => <option key={`s-${s.id}`} value={s.medicine_name} />)}
                      {AYUSH_THERAPIES.map((t) => <option key={`t-${t.code}`} value={`${t.code} · ${t.name}`}>₹{t.price} · {t.system}</option>)}
                    </datalist>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Sparkles className="h-3 w-3" /> Type a medicine, or pick an Ayush therapy (Ayurveda · Yoga · Naturopathy · Unani · Siddha) — price auto-fills from Ayush 2026 benchmark.</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setLines([...lines, { medicine_name: "", quantity: "1", unit_price: "0" }])}>+ Add line</Button>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 p-3 text-sm">
                  <span>Subtotal: <strong>₹{subtotal}</strong></span>
                  <div className="flex items-center gap-2">
                    <Label className="m-0">Discount</Label>
                    <Input type="number" className="w-24" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                  </div>
                  <span>Total: <strong className="text-primary">₹{total}</strong></span>
                </div>
              </div>
              <DialogFooter><Button onClick={submit}>Save bill</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <ReceiptText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No bills yet.</p>
        </Card>
      ) : (
        <Card className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Patient</th>
                <th className="py-2 pr-2">Subtotal</th>
                <th className="py-2 pr-2">Discount</th>
                <th className="py-2 pr-2">Total</th>
                <th className="py-2 pr-2">Mode</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-3 pr-2 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="py-3 pr-2 font-medium">{b.patient_name}</td>
                  <td className="py-3 pr-2">₹{b.subtotal}</td>
                  <td className="py-3 pr-2">₹{b.discount}</td>
                  <td className="py-3 pr-2 font-semibold text-primary">₹{b.total}</td>
                  <td className="py-3 pr-2 capitalize text-xs">{b.payment_mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default BillsPage;
