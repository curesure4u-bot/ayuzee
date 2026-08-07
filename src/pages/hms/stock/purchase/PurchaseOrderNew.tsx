import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PurchaseOrderNew = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [location, setLocation] = useState("loc1");
  const [supplier, setSupplier] = useState("");
  const [store, setStore] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

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
    if (!quantity || parseFloat(quantity) <= 0) { toast.error("Quantity must be greater than 0"); return; }

    setSaving(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      // Use the selected store as the to_store, and find a "main" source store
      const toStoreId = store;
      // Use the first store as from_store (main supplier store) or same store if only one
      const fromStoreId = wardStores.length > 1 
        ? wardStores.find(s => s.id !== toStoreId)?.id || toStoreId
        : toStoreId;

      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .insert({
          from_store_id: fromStoreId,
          to_store_id: toStoreId,
          product_name: productName.trim(),
          quantity: parseFloat(quantity),
          batch_number: batchNumber || null,
          transfer_reason: `PO from supplier: ${supplier}`,
          status: "pending",
          requested_by: user.id,
        });

      if (error) throw error;
      toast.success("Purchase Order created in Supabase");
      navigate("/hms/stock/purchase/po/manage");
    } catch (err: any) {
      toast.error("Failed to create PO: " + (err.message || "Unknown error"));
      console.error("PO create error:", err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/purchase/po/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage PO</Button>
        </Link>
        <Link to="/hms/stock/purchase/po/find">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Find Product PO</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">PO</h2>
      </div>

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
                  <SelectItem value="loc4">Kulavanikar Puram Road, Tirunelveli</SelectItem>
                  <SelectItem value="loc5">Keelkattalai, Chennai</SelectItem>
                  <SelectItem value="loc6">Tenkasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Supplier * :</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue placeholder="" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha;erode;lk;Erode;0</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD 044-26202188</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES 9994143187</SelectItem>
                  <SelectItem value="rich">RICH HERBALS 7538883888</SelectItem>
                  <SelectItem value="siddha">SIDDHASRAMAM SIVANANANDA VIJAYAM OUSHADASHALA</SelectItem>
                  <SelectItem value="arya">THE ARYA VAIDYA PHARMACY 0422-4280171</SelectItem>
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
            <div>
              <Label className="text-sm font-semibold">Product Name * :</Label>
              <Input placeholder="Enter product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Quantity * :</Label>
              <Input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-semibold">Batch Number :</Label>
              <Input placeholder="Batch (optional)" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
            </div>
            <div className="text-center pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 px-8">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderNew;
