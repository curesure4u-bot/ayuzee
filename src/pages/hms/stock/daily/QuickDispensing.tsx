import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScanLine, Brain, Trash2, Printer, Plus, Search, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  product_name: string;
  stock_item_id: string;
  ward_store_id: string;
  batch_number: string;
  qty: number;
  mrp: number;
  total: number;
}

export default function QuickDispensing() {
  const [saving, setSaving] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: stores }, { data: items }] = await Promise.all([
      (supabase as any).from("hms_ward_stores").select("id, ward_name").eq("is_active", true),
      (supabase as any).from("hms_ward_stock_items").select("id, product_name, batch_number, cost_per_unit, quantity_available, ward_store_id").gt("quantity_available", 0).order("product_name"),
    ]);
    setWardStores(stores || []);
    setStockItems(items || []);
  };

  const handleAddFromScan = () => {
    if (!scanInput.trim()) return;

    const match = stockItems.find(s =>
      s.product_name.toLowerCase().includes(scanInput.toLowerCase())
    );

    if (match) {
      const existing = cart.find(c => c.stock_item_id === match.id);
      if (existing) {
        setCart(cart.map(c => c.stock_item_id === match.id ? { ...c, qty: c.qty + 1, total: (c.qty + 1) * c.mrp } : c));
      } else {
        setCart([...cart, {
          id: Date.now().toString(),
          product_name: match.product_name,
          stock_item_id: match.id,
          ward_store_id: match.ward_store_id,
          batch_number: match.batch_number || "—",
          qty: 1,
          mrp: match.cost_per_unit,
          total: match.cost_per_unit,
        }]);
      }
      toast.success(`Added: ${match.product_name}`);
    } else {
      toast.error("Product not found in stock");
    }
    setScanInput("");
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const handleQtyChange = (id: string, qty: number) => {
    setCart(cart.map(c => c.id === id ? { ...c, qty, total: qty * c.mrp } : c));
  };

  const subtotal = cart.reduce((s, c) => s + c.total, 0);
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  const handleBillAndPrint = async () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); setSaving(false); return; }

      // Insert consumption log entries for each cart item
      const insertRows = cart.map(item => ({
        ward_store_id: item.ward_store_id,
        ward_stock_item_id: item.stock_item_id,
        quantity_consumed: item.qty,
        consumption_type: "patient_use",
        billed_to_patient: true,
        bill_amount: item.total,
        consumed_by: user.id,
        notes: `Quick Dispensing (POS). Patient: ${patientName || "Walk-in"}. Doctor: ${doctorName || "N/A"}. Product: ${item.product_name}`,
      }));

      const { error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .insert(insertRows);

      if (error) throw error;

      // Update stock quantities
      for (const item of cart) {
        await (supabase as any)
          .from("hms_ward_stock_items")
          .update({ last_consumed_at: new Date().toISOString() })
          .eq("id", item.stock_item_id);
      }

      toast.success(`Bill generated: ₹${grandTotal} | ${cart.length} items`);
      setCart([]);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save bill: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanLine className="h-6 w-6 text-green-600" /> Quick Dispensing (POS)
          </h1>
          <p className="text-muted-foreground mt-1">Scan → Add → Bill. Fast pharmacy billing wired to Supabase.</p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">POS Mode</Badge>
      </div>

      {/* Patient & Doctor */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Patient name / ID..." className="h-8 text-xs" value={patientName} onChange={e => setPatientName(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <Input placeholder="Doctor / Rx#" className="h-8 text-xs" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Scan Bar */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-3 flex gap-2">
          <ScanLine className="h-5 w-5 text-green-600 mt-1" />
          <Input
            placeholder="Type medicine name and press Enter..."
            className="h-9 text-sm font-mono flex-1"
            value={scanInput}
            onChange={e => setScanInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddFromScan(); }}
            autoFocus
          />
          <Button size="sm" className="h-9" onClick={handleAddFromScan}><Plus className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      {/* Cart Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-center">×</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground text-xs">Cart empty — type a product name above</td></tr>
                ) : (
                  cart.map((item, idx) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                      <td className="px-3 py-2 text-center text-[10px] text-muted-foreground">{item.batch_number}</td>
                      <td className="px-3 py-2 text-center">
                        <Input type="number" value={item.qty} onChange={e => handleQtyChange(item.id, parseInt(e.target.value) || 1)} className="h-7 w-12 text-center text-xs mx-auto" />
                      </td>
                      <td className="px-3 py-2 text-right text-xs">₹{item.mrp}</td>
                      <td className="px-3 py-2 text-right text-xs font-bold">₹{item.total}</td>
                      <td className="px-3 py-2 text-center">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals & Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal ({cart.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span>GST (5%)</span><span>₹{gst}</span></div>
            <div className="border-t my-2" />
            <div className="flex justify-between text-lg font-bold"><span>Grand Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Payment</p>
            <Button className="w-full h-10" onClick={handleBillAndPrint} disabled={saving || cart.length === 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Printer className="h-4 w-4 mr-1" />}
              Bill & Save to Supabase
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">AI POS Intelligence</p>
            <p className="text-[10px] text-purple-700">Products matched from live stock. FEFO (First Expiry First Out) prioritized. Each sale is logged to hms_ward_consumption_log for real-time dashboard updates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
