import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Package, Plus, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";

type InventoryItem = { id: string; name: string; current_stock: number; reorder_level: number; unit: string; supplier: string };
const uid = () => crypto.randomUUID();

const sampleItems: InventoryItem[] = [
  { id: uid(), name: "Triphala Churna", current_stock: 12, reorder_level: 50, unit: "packs", supplier: "Sindhu Pharma" },
  { id: uid(), name: "Ashwagandha Capsules", current_stock: 30, reorder_level: 50, unit: "bottles", supplier: "AVN Arogya" },
  { id: uid(), name: "Ksheerabala Oil (101)", current_stock: 8, reorder_level: 20, unit: "bottles", supplier: "Kottakkal" },
  { id: uid(), name: "Dasamoolarishtam", current_stock: 65, reorder_level: 30, unit: "bottles", supplier: "AVN Arogya" },
  { id: uid(), name: "Rasnasaptakam Kashayam", current_stock: 5, reorder_level: 25, unit: "packs", supplier: "Kottakkal" },
  { id: uid(), name: "Guggulutiktakam Ghritam", current_stock: 40, reorder_level: 15, unit: "bottles", supplier: "AVN Arogya" },
  { id: uid(), name: "Prescription Pads", current_stock: 2, reorder_level: 10, unit: "pads", supplier: "Stationery Mart" },
  { id: uid(), name: "Therapy Bed Sheets", current_stock: 18, reorder_level: 20, unit: "sets", supplier: "Linen House" },
];

const TaskTrackerInventoryAlerts = () => {
  const [items, setItems] = useState<InventoryItem[]>(sampleItems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", current_stock: "", reorder_level: "", unit: "units", supplier: "" });

  const belowReorder = items.filter(i => i.current_stock <= i.reorder_level);
  const okItems = items.filter(i => i.current_stock > i.reorder_level);

  const addItem = () => {
    if (!form.name.trim()) { toast.error("Item name required"); return; }
    setItems(prev => [...prev, { id: uid(), name: form.name, current_stock: Number(form.current_stock) || 0, reorder_level: Number(form.reorder_level) || 10, unit: form.unit, supplier: form.supplier }]);
    setDialogOpen(false);
    setForm({ name: "", current_stock: "", reorder_level: "", unit: "units", supplier: "" });
    toast.success("Item added to inventory tracking");
  };

  const stockPct = (item: InventoryItem) => Math.min(100, Math.round((item.current_stock / Math.max(item.reorder_level * 2, 1)) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-amber-600" /> Inventory Alerts</h1>
          <p className="text-sm text-muted-foreground">Track stock levels and get reorder alerts</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700"><Plus className="mr-1 h-4 w-4" /> Add Item</Button>
      </div>

      {/* Alert Banner */}
      {belowReorder.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <p className="text-sm font-bold text-red-700 flex items-center gap-1 mb-2"><AlertTriangle className="h-4 w-4" /> {belowReorder.length} items below reorder level!</p>
            <div className="space-y-1">
              {belowReorder.map(i => (
                <div key={i.id} className="flex items-center gap-2 text-xs">
                  <span className="font-medium">{i.name}</span>
                  <Badge variant="destructive" className="text-[9px]">{i.current_stock} {i.unit} left</Badge>
                  <span className="text-muted-foreground ml-auto">Reorder at: {i.reorder_level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="flex gap-3">
        <Badge variant="outline" className="px-3 py-1.5">{items.length} items tracked</Badge>
        <Badge variant="destructive" className="px-3 py-1.5"><AlertTriangle className="mr-1 h-3 w-3" />{belowReorder.length} need reorder</Badge>
        <Badge variant="outline" className="px-3 py-1.5 text-green-600"><CheckCircle className="mr-1 h-3 w-3" />{okItems.length} OK</Badge>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.sort((a, b) => (a.current_stock / a.reorder_level) - (b.current_stock / b.reorder_level)).map(item => {
          const isLow = item.current_stock <= item.reorder_level;
          const pct = stockPct(item);
          return (
            <Card key={item.id} className={`hover:shadow-sm ${isLow ? "border-red-200" : ""}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-lg shrink-0 ${isLow ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {isLow ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {isLow && <Badge variant="destructive" className="text-[9px]">LOW</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={pct} className={`h-1.5 flex-1 max-w-[120px] ${isLow ? "[&>div]:bg-red-500" : ""}`} />
                    <span className={`text-xs font-bold ${isLow ? "text-red-600" : ""}`}>{item.current_stock} {item.unit}</span>
                    <span className="text-[10px] text-muted-foreground">(reorder at {item.reorder_level})</span>
                  </div>
                  {item.supplier && <p className="text-[10px] text-muted-foreground">Supplier: {item.supplier}</p>}
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 shrink-0" onClick={() => setItems(prev => prev.filter(x => x.id !== item.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-amber-600">Add Inventory Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Item Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Triphala Churna" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Current Stock</Label><Input type="number" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} /></div>
              <div><Label>Reorder Level</Label><Input type="number" value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: e.target.value }))} /></div>
              <div><Label>Unit</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="packs" /></div>
            </div>
            <div><Label>Supplier</Label><Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={addItem} className="bg-amber-600 hover:bg-amber-700">Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTrackerInventoryAlerts;
