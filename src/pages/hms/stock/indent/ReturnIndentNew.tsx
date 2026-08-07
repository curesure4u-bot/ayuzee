import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ReturnIndentNew = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [location, setLocation] = useState("loc1");
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [returnTime, setReturnTime] = useState("10:00");
  const [status, setStatus] = useState("pending");
  const [additionalNote, setAdditionalNote] = useState("");
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
    if (data && data.length > 0) {
      setFromStore(data[0].id);
      if (data.length > 1) setToStore(data[1].id);
    }
  };

  const handleSave = async () => {
    if (!fromStore || !toStore) { toast.error("Both stores are required"); return; }
    if (!productName.trim()) { toast.error("Product name is required"); return; }
    if (!quantity || parseFloat(quantity) <= 0) { toast.error("Quantity must be > 0"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .insert({
          from_store_id: fromStore,
          to_store_id: toStore,
          product_name: productName.trim(),
          quantity: parseFloat(quantity),
          batch_number: batchNumber || null,
          transfer_reason: `Return Indent. ${additionalNote}`.trim(),
          status: status,
          requested_by: user.id,
        });

      if (error) throw error;
      toast.success("Return Indent saved to Supabase");
      navigate("/hms/stock/indent/return/manage");
    } catch (err: any) {
      toast.error("Failed to save: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New</Button>
        <Link to="/hms/stock/indent/return/empty-store">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Empty Store</Button>
        </Link>
        <Link to="/hms/stock/indent/return/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Return Indent</Button>
        </Link>
      </div>

      <div className="text-center"><h2 className="text-xl font-semibold text-orange-600">Return Indent</h2></div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Product Details */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-sm mb-3">Product to Return</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Product Name *</Label>
                <Input placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Quantity *</Label>
                <Input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Batch Number</Label>
                <Input placeholder="Batch" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Location/Store/Status/Date */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold">Location * :</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Status * :</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Return Date * :</Label>
              <div className="flex gap-1">
                <Input type="date" className="h-8 text-xs" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                <Input type="time" className="h-8 text-xs w-20" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold">From * :</Label>
              <Select value={fromStore} onValueChange={setFromStore}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select store" /></SelectTrigger>
                <SelectContent>
                  {wardStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">To * :</Label>
              <Select value={toStore} onValueChange={setToStore}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select store" /></SelectTrigger>
                <SelectContent>
                  {wardStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Additional Note :</Label>
            <Textarea value={additionalNote} onChange={(e) => setAdditionalNote(e.target.value)} rows={2} />
          </div>
          <div className="text-center">
            <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700 px-8">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnIndentNew;
