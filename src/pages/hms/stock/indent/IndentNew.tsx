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

const IndentNew = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [location, setLocation] = useState("loc1");
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");

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
    if (!toStore) { toast.error("To Store is required"); return; }
    if (!productName.trim()) { toast.error("Product name is required"); return; }
    if (!quantity || parseFloat(quantity) <= 0) { toast.error("Quantity must be > 0"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const fromStoreId = fromStore || (wardStores.length > 0 ? wardStores[0].id : toStore);

      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .insert({
          from_store_id: fromStoreId,
          to_store_id: toStore,
          product_name: productName.trim(),
          quantity: parseFloat(quantity),
          transfer_reason: "Indent request",
          status: "pending",
          requested_by: user.id,
        });

      if (error) throw error;
      toast.success("Indent created in Supabase");
      navigate("/hms/stock/indent/manage");
    } catch (err: any) {
      toast.error("Failed to create indent: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub Nav */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">New Indent</Button>
        <Link to="/hms/stock/indent/manage">
          <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">Manage Indent</Button>
        </Link>
        <Link to="/hms/stock/indent/gdn/new">
          <Button size="sm" variant="outline" className="text-red-600 border-red-300">New GDN</Button>
        </Link>
        <Link to="/hms/stock/indent/gdn/manage">
          <Button size="sm" variant="outline" className="text-red-600 border-red-300">Manage GDN</Button>
        </Link>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Indent</h2>
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
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">From Store :</Label>
              <Select value={fromStore} onValueChange={setFromStore}>
                <SelectTrigger><SelectValue placeholder="Select source store" /></SelectTrigger>
                <SelectContent>
                  {wardStores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">To Store * :</Label>
              <Select value={toStore} onValueChange={setToStore}>
                <SelectTrigger><SelectValue placeholder="Select destination store" /></SelectTrigger>
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
            <div className="text-center pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-amber-700 hover:bg-amber-800 px-8">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndentNew;
