import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, ScanLine, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AIInvoiceScanner, { type ExtractedInvoiceData } from "../ai/AIInvoiceScanner";

const GRNNew = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [location, setLocation] = useState("loc1");
  const [supplier, setSupplier] = useState("");
  const [store, setStore] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [invoiceData, setInvoiceData] = useState<ExtractedInvoiceData | null>(null);

  useEffect(() => {
    loadWardStores();
  }, []);

  const loadWardStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
  };

  const handleSave = async () => {
    if (!supplier) { toast.error("Supplier is required"); return; }
    if (!store) { toast.error("Store is required"); return; }
    if (!productName.trim()) { toast.error("Product name is required"); return; }
    if (!quantity || parseFloat(quantity) <= 0) { toast.error("Quantity must be > 0"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      // 1. Insert stock item into hms_ward_stock_items
      const { data: stockItem, error: stockError } = await (supabase as any)
        .from("hms_ward_stock_items")
        .insert({
          ward_store_id: store,
          product_name: productName.trim(),
          product_category: productCategory || null,
          batch_number: batchNumber || null,
          expiry_date: expiryDate || null,
          quantity_available: parseFloat(quantity),
          quantity_unit: "units",
          min_stock_level: 5,
          max_stock_level: 100,
          cost_per_unit: parseFloat(costPerUnit) || 0,
          last_restocked_at: new Date().toISOString(),
          is_critical: false,
        })
        .select("id")
        .single();

      if (stockError) throw stockError;

      // 2. Log the receipt in consumption log as 'transfer' type
      const { error: logError } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .insert({
          ward_store_id: store,
          ward_stock_item_id: stockItem.id,
          quantity_consumed: parseFloat(quantity),
          consumption_type: "transfer",
          billed_to_patient: false,
          bill_amount: parseFloat(quantity) * (parseFloat(costPerUnit) || 0),
          consumed_by: user.id,
          notes: `GRN receipt from supplier: ${supplier}. Batch: ${batchNumber || "N/A"}`,
        });

      if (logError) throw logError;

      toast.success("GRN saved to Supabase — stock updated");
      navigate("/hms/stock/purchase/grn/manage");
    } catch (err: any) {
      toast.error("Failed to save GRN: " + (err.message || "Unknown error"));
      console.error("GRN save error:", err);
    }
    setSaving(false);
  };

  const handleAIExtracted = (data: ExtractedInvoiceData) => {
    setInvoiceData(data);
    // Auto-fill supplier from AI extraction
    if (data.supplier.name.includes("KOTTAKKAL")) setSupplier("kottakkal");
    else if (data.supplier.name.includes("RAJAH")) setSupplier("rajah");
    else if (data.supplier.name.includes("AVM")) setSupplier("avm");
    else setSupplier("skm");

    // Auto-select store if not selected
    if (!store && wardStores.length > 0) setStore(wardStores[0].id);

    // Auto-fill first product if available
    if (data.products.length > 0) {
      const first = data.products[0];
      setProductName(first.name || "");
      setBatchNumber(first.batch || "");
      setQuantity(first.qty?.toString() || "");
      setCostPerUnit(first.rate?.toString() || "");
    }

    toast.success(`AI auto-filled: ${data.supplier.name} | ${data.products.length} products | Invoice: ${data.supplier.invoiceNo}`);
    setShowAIScanner(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/purchase/grn/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage GRN</Button>
        </Link>
        <Link to="/hms/stock/purchase/grn/drafts">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage GRN Drafts</Button>
        </Link>
        <Button size="sm" variant="outline" className="ml-auto bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100" onClick={() => setShowAIScanner(!showAIScanner)}>
          <Brain className="mr-1 h-4 w-4" /> {showAIScanner ? "Hide AI Scanner" : "AI Scan Invoice"}
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">GRN</h2>
      </div>

      {/* AI Invoice Scanner */}
      {showAIScanner && (
        <AIInvoiceScanner onExtracted={handleAIExtracted} context="grn" />
      )}

      {/* AI Auto-filled notice */}
      {invoiceData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <ScanLine className="h-4 w-4" />
          AI auto-filled from invoice <strong>{invoiceData.supplier.invoiceNo}</strong>: {invoiceData.products.length} products, Total: ₹{invoiceData.totals.grandTotal.toLocaleString()}
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="max-w-lg mx-auto space-y-4">
            <div>
              <Label className="text-sm font-semibold">Location * :</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem>
                  <SelectItem value="loc2">PACR SALAI, Rajapalayam</SelectItem>
                  <SelectItem value="loc3">Old GH Road, Theni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Supplier * :</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha ,erode ,lk ,Erode ,0</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES</SelectItem>
                  <SelectItem value="rich">RICH HERBALS</SelectItem>
                  <SelectItem value="kottakkal">KOTTAKKAL ARYA VAIDYA SALA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Store * :</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger><SelectValue placeholder="Select Store" /></SelectTrigger>
                <SelectContent>
                  {wardStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-orange-600">Product Details</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Product Name *</Label>
                  <Input placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm">Category</Label>
                  <Input placeholder="e.g. Taila, Churna, Tablet" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Batch Number</Label>
                    <Input placeholder="Batch" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Expiry Date</Label>
                    <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Quantity *</Label>
                    <Input type="number" placeholder="Qty received" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm">Cost per Unit</Label>
                    <Input type="number" step="0.01" placeholder="₹" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 px-8">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save GRN"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GRNNew;
