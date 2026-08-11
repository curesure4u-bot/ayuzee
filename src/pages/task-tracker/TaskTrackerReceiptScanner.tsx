import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Plus, Receipt, Trash2, Upload } from "lucide-react";

type ReceiptEntry = { id: string; amount: number; category: string; vendor: string; date: string; notes: string; image_url: string };
const uid = () => crypto.randomUUID();
const EXPENSE_CATS = ["Medicines", "Equipment", "Rent", "Utilities", "Staff Salary", "Food", "Transport", "Office Supplies", "Marketing", "Lab/Diagnostic", "Maintenance", "Other"];

const sampleReceipts: ReceiptEntry[] = [
  { id: uid(), amount: 3200, category: "Medicines", vendor: "Sindhu Pharma", date: "2025-05-12", notes: "Monthly restock — Triphala, Ashwagandha, Guggulu", image_url: "" },
  { id: uid(), amount: 850, category: "Utilities", vendor: "BESCOM", date: "2025-05-10", notes: "Electricity bill — May 2025", image_url: "" },
  { id: uid(), amount: 1500, category: "Transport", vendor: "Petrol Bunk", date: "2025-05-09", notes: "Fuel for the week", image_url: "" },
  { id: uid(), amount: 500, category: "Office Supplies", vendor: "Stationery Mart", date: "2025-05-08", notes: "Printer paper, pens, prescription pads", image_url: "" },
];

const TaskTrackerReceiptScanner = () => {
  const [receipts, setReceipts] = useState<ReceiptEntry[]>(sampleReceipts);
  const [form, setForm] = useState({ amount: "", category: "Other", vendor: "", date: new Date().toISOString().split("T")[0], notes: "" });

  const addReceipt = () => {
    if (!form.amount) { toast.error("Amount is required"); return; }
    setReceipts(prev => [{ id: uid(), amount: Number(form.amount), category: form.category, vendor: form.vendor, date: form.date, notes: form.notes, image_url: "" }, ...prev]);
    setForm({ amount: "", category: "Other", vendor: "", date: new Date().toISOString().split("T")[0], notes: "" });
    toast.success("Receipt logged! Added to your expenses.");
  };

  const totalThisMonth = receipts.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Receipt className="h-6 w-6 text-emerald-600" /> Receipt Scanner</h1>
          <p className="text-sm text-muted-foreground">Snap a receipt → log the expense instantly</p>
        </div>
        <Badge variant="outline" className="text-sm">Total: ₹{totalThisMonth.toLocaleString()}</Badge>
      </div>

      {/* Quick Log */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            {/* Camera placeholder */}
            <div className="grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-emerald-300 bg-white cursor-pointer hover:bg-emerald-50 shrink-0">
              <div className="text-center">
                <Camera className="h-6 w-6 mx-auto text-emerald-400" />
                <p className="text-[8px] text-muted-foreground mt-0.5">Tap to scan</p>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px]">Amount (₹) *</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Category</Label><Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{EXPENSE_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[10px]">Vendor/Shop</Label><Input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="Who paid to?" className="h-8 text-xs" /></div>
                <div><Label className="text-[10px]">Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-8 text-xs" /></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="What was this for?" className="h-8 text-xs flex-1" />
            <Button size="sm" onClick={addReceipt} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="mr-1 h-3.5 w-3.5" /> Log</Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipt History */}
      <div className="space-y-2">
        {receipts.map(r => (
          <Card key={r.id} className="hover:shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm shrink-0">₹</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="font-bold text-sm">₹{r.amount.toLocaleString()}</p><Badge variant="outline" className="text-[9px]">{r.category}</Badge></div>
                <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                  {r.vendor && <span>{r.vendor}</span>}
                  <span>{r.date}</span>
                  {r.notes && <span>· {r.notes}</span>}
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={() => setReceipts(prev => prev.filter(x => x.id !== r.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskTrackerReceiptScanner;
