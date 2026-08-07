import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ScanLine, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import QRBarcodeScanner, { type ScannedProductResult } from "../ai/QRBarcodeScanner";

const StockAdjustment = () => {
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [stockItems, setStockItems] = useState<{ id: string; product_name: string; quantity_available: number; ward_store_id: string; batch_number: string | null }[]>([]);
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("");
  const [productName, setProductName] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [batch, setBatch] = useState("");
  const [expiry, setExpiry] = useState("");
  const [punit, setPunit] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [maxSalesDisc, setMaxSalesDisc] = useState("");
  const [taxPercent, setTaxPercent] = useState("");
  const [reason, setReason] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [matchedItemId, setMatchedItemId] = useState<string | null>(null);

  useEffect(() => {
    loadWardStores();
    loadStockItems();
  }, []);

  const loadWardStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
    if (data && data.length > 0) setStore(data[0].id);
  };

  const loadStockItems = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stock_items")
      .select("id, product_name, quantity_available, ward_store_id, batch_number")
      .order("product_name", { ascending: true });
    setStockItems(data || []);
  };

  // Auto-fill current stock when product name changes
  useEffect(() => {
    if (productName) {
      const match = stockItems.find(s =>
        s.product_name.toLowerCase() === productName.toLowerCase()
      );
      if (match) {
        setCurrentStock(match.quantity_available.toString());
        setMatchedItemId(match.id);
        if (match.batch_number) setBatch(match.batch_number);
      } else {
        setCurrentStock("");
        setMatchedItemId(null);
      }
    }
  }, [productName, stockItems]);

  const handleQRScanned = (result: ScannedProductResult) => {
    setProductName(result.name);
    setBatch(result.batch);
    setExpiry(result.expiry);
    setMrp(result.mrp.toString());
    setShowQRScanner(false);
    toast.success(`QR scanned: ${result.name}`);
  };

  const handleSave = async () => {
    if (!productName) { toast.error("Product name is required"); return; }
    if (!qty) { toast.error("Quantity is required"); return; }
    if (!reason) { toast.error("Reason is required"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const adjustQty = parseFloat(qty);

      if (matchedItemId) {
        // Update existing stock item quantity
        const newQty = parseFloat(currentStock) + adjustQty;
        const { error: updateError } = await (supabase as any)
          .from("hms_ward_stock_items")
          .update({
            quantity_available: newQty >= 0 ? newQty : 0,
            cost_per_unit: rate ? parseFloat(rate) : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", matchedItemId);

        if (updateError) throw updateError;

        // Log the adjustment in consumption log
        const { error: logError } = await (supabase as any)
          .from("hms_ward_consumption_log")
          .insert({
            ward_store_id: store,
            ward_stock_item_id: matchedItemId,
            quantity_consumed: Math.abs(adjustQty),
            consumption_type: adjustQty < 0 ? "wastage" : "returned",
            billed_to_patient: false,
            bill_amount: 0,
            consumed_by: user.id,
            notes: `Stock Adjustment: ${reason}. Qty change: ${adjustQty > 0 ? "+" : ""}${adjustQty}`,
          });

        if (logError) throw logError;
      } else {
        // Create new stock item with this adjustment
        const { data: newItem, error: insertError } = await (supabase as any)
          .from("hms_ward_stock_items")
          .insert({
            ward_store_id: store,
            product_name: productName.trim(),
            batch_number: batch || null,
            expiry_date: expiry || null,
            quantity_available: adjustQty >= 0 ? adjustQty : 0,
            quantity_unit: punit || "units",
            min_stock_level: 5,
            max_stock_level: 100,
            cost_per_unit: parseFloat(rate) || 0,
            is_critical: false,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // Log
        await (supabase as any)
          .from("hms_ward_consumption_log")
          .insert({
            ward_store_id: store,
            ward_stock_item_id: newItem.id,
            quantity_consumed: Math.abs(adjustQty),
            consumption_type: "returned",
            billed_to_patient: false,
            bill_amount: 0,
            consumed_by: user.id,
            notes: `Stock Adjustment (new item): ${reason}. Qty: ${adjustQty}`,
          });
      }

      toast.success("Stock adjustment saved to Supabase");
      // Reset form
      setProductName("");
      setCurrentStock("");
      setBatch("");
      setExpiry("");
      setQty("");
      setRate("");
      setMrp("");
      setReason("");
      setMatchedItemId(null);
      loadStockItems();
    } catch (err: any) {
      toast.error("Failed to save adjustment: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Stock Adjustment</Button>
        <Button size="sm" variant="outline" className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100" onClick={() => setShowQRScanner(!showQRScanner)}>
          <ScanLine className="mr-1 h-4 w-4" /> {showQRScanner ? "Hide Scanner" : "QR/Barcode Scan"}
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Stock Adjustment</h2>
      </div>

      {/* QR Scanner */}
      {showQRScanner && (
        <QRBarcodeScanner onScanned={handleQRScanned} context="adjustment" />
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Location & Store */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-semibold">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Store</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {wardStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Name</Label>
              <Input placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Stock</Label>
              <Input placeholder="Current Stock" value={currentStock} readOnly className="bg-gray-50" />
            </div>
          </div>

          {/* Batch, Expiry, Punit, Qty */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-semibold">Batch</Label>
              <Input placeholder="Batch" value={batch} onChange={(e) => setBatch(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Expiry</Label>
              <Input placeholder="Expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Punit</Label>
              <Input placeholder="Punit" value={punit} onChange={(e) => setPunit(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Qty (+/-)</Label>
              <Input placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
          </div>

          {/* Rate, MRP, Max Sales Disc, Tax */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-semibold">Rate</Label>
              <Input placeholder="Rate" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">MRP</Label>
              <Input placeholder="MRP" value={mrp} onChange={(e) => setMrp(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Max Sales Dis(%)</Label>
              <Input placeholder="" value={maxSalesDisc} onChange={(e) => setMaxSalesDisc(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tax(%)</Label>
              <Select value={taxPercent} onValueChange={setTaxPercent}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label className="text-sm font-semibold">Reason *</Label>
            <Input placeholder="Reason for adjustment" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <div className="text-center pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 px-8">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAdjustment;
