import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, RotateCcw, CheckCircle, AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ReturnRecord = {
  id: string;
  product_name: string;
  quantity_consumed: number;
  bill_amount: number | null;
  notes: string | null;
  created_at: string;
  store_name?: string;
};

export default function PatientReturn() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [stockItems, setStockItems] = useState<{ id: string; product_name: string; ward_store_id: string }[]>([]);

  // New return form
  const [showForm, setShowForm] = useState(false);
  const [returnStore, setReturnStore] = useState("");
  const [returnProduct, setReturnProduct] = useState("");
  const [returnQty, setReturnQty] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: stores }, { data: items }, { data: returnLogs }] = await Promise.all([
        (supabase as any).from("hms_ward_stores").select("id, ward_name").eq("is_active", true),
        (supabase as any).from("hms_ward_stock_items").select("id, product_name, ward_store_id").gt("quantity_available", 0),
        (supabase as any).from("hms_ward_consumption_log").select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)").eq("consumption_type", "returned").order("created_at", { ascending: false }).limit(50),
      ]);

      setWardStores(stores || []);
      setStockItems(items || []);
      if (stores && stores.length > 0) setReturnStore(stores[0].id);

      setReturns((returnLogs || []).map((row: any) => ({
        ...row,
        product_name: row.hms_ward_stock_items?.product_name || "—",
        store_name: row.hms_ward_stores?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load return data");
      console.error(err);
    }
    setLoading(false);
  };

  const handleProcessReturn = async () => {
    if (!returnStore) { toast.error("Store is required"); return; }
    if (!returnProduct.trim()) { toast.error("Product name is required"); return; }
    if (!returnQty || parseFloat(returnQty) <= 0) { toast.error("Quantity must be > 0"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); setSaving(false); return; }

      // Find matching stock item
      const matched = stockItems.find(s => s.product_name.toLowerCase() === returnProduct.toLowerCase());

      const { error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .insert({
          ward_store_id: returnStore,
          ward_stock_item_id: matched?.id || stockItems[0]?.id,
          quantity_consumed: parseFloat(returnQty),
          consumption_type: "returned",
          billed_to_patient: false,
          bill_amount: 0,
          consumed_by: user.id,
          notes: `Patient Return. Patient: ${patientName || "Walk-in"}. Reason: ${returnReason || "N/A"}. Product: ${returnProduct}`,
        });

      if (error) throw error;

      // Also update stock quantity (add back)
      if (matched) {
        const { data: current } = await (supabase as any)
          .from("hms_ward_stock_items")
          .select("quantity_available")
          .eq("id", matched.id)
          .single();

        if (current) {
          await (supabase as any)
            .from("hms_ward_stock_items")
            .update({ quantity_available: current.quantity_available + parseFloat(returnQty) })
            .eq("id", matched.id);
        }
      }

      toast.success("Patient return processed");
      setShowForm(false);
      setReturnProduct("");
      setReturnQty("");
      setReturnReason("");
      setPatientName("");
      loadData();
    } catch (err: any) {
      toast.error("Failed: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  const totalCredits = returns.reduce((s, r) => s + (r.bill_amount || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><RotateCcw className="h-6 w-6 text-amber-600" /> Patient Return / Exchange</h1>
          <p className="text-muted-foreground mt-1">Accept returns, restock items, log in Supabase.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Process Return"}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{returns.length}</p><p className="text-xs text-muted-foreground">Total Returns</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{returns.length}</p><p className="text-xs text-muted-foreground">Processed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CreditCard className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">₹{totalCredits}</p><p className="text-xs text-muted-foreground">Credits Issued</p></CardContent></Card>
      </div>

      {/* New Return Form */}
      {showForm && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Process New Return</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Store</Label>
                <Select value={returnStore} onValueChange={setReturnStore}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {wardStores.map(s => <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Patient Name</Label>
                <Input className="h-8 text-xs" placeholder="Patient" value={patientName} onChange={e => setPatientName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Product Name *</Label>
                <Input className="h-8 text-xs" placeholder="Product" value={returnProduct} onChange={e => setReturnProduct(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Quantity *</Label>
                <Input className="h-8 text-xs" type="number" placeholder="Qty" value={returnQty} onChange={e => setReturnQty(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Reason</Label>
                <Input className="h-8 text-xs" placeholder="Reason for return" value={returnReason} onChange={e => setReturnReason(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleProcessReturn} disabled={saving} size="sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Submit Return
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Returns Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Returns</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {returns.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No returns recorded</td></tr>
                ) : (
                  returns.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs">{r.store_name}</td>
                      <td className="px-3 py-2 text-xs font-medium">{r.product_name}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{r.quantity_consumed}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px] truncate">{r.notes || "—"}</td>
                      <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">AI Return Intelligence</p>
            <p className="text-[10px] text-purple-700">
              {returns.length > 0
                ? `${returns.length} returns processed. Stock automatically restocked for eligible items.`
                : "No returns yet. When a return is processed, stock is auto-adjusted."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
