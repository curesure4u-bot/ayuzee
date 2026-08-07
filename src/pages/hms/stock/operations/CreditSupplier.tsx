import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SupplierCredit = {
  id: string;
  product_name: string;
  quantity: number;
  transfer_reason: string | null;
  created_at: string;
  from_store_name?: string;
  to_store_name?: string;
  status: string;
};

const CreditSupplier = () => {
  const [records, setRecords] = useState<SupplierCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [location, setLocation] = useState("loc1");
  const [store, setStore] = useState("all");
  const [supplier, setSupplier] = useState("");

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name), from_store:hms_ward_stores!hms_ward_stock_transfers_from_store_id_fkey(ward_name)")
        .ilike("transfer_reason", "%supplier%")
        .order("created_at", { ascending: false });

      if (store !== "all") query = query.eq("to_store_id", store);

      const { data, error } = await query;
      if (error) throw error;

      let filtered = (data || []).map((row: any) => ({
        ...row,
        from_store_name: row.from_store?.ward_name || "—",
        to_store_name: row.to_store?.ward_name || "—",
      }));

      if (supplier.trim()) {
        filtered = filtered.filter((r: any) => (r.transfer_reason || "").toLowerCase().includes(supplier.toLowerCase()));
      }

      setRecords(filtered);
    } catch (err: any) {
      toast.error("Failed to search");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Credit Supplier</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <Label className="text-xs font-semibold">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Store</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Show All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Show All</SelectItem>
                  {wardStores.map(s => <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Supplier</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="skm">skm siddha and ayrvedha</SelectItem>
                  <SelectItem value="rajah">RAJAH HEALTHY ACRES P LTD</SelectItem>
                  <SelectItem value="avm">AVM HOMOEO AGENCIES</SelectItem>
                  <SelectItem value="rich">RICH HERBALS</SelectItem>
                  <SelectItem value="kottakkal">KOTTAKKAL ARYA VAIDYA SALA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="self-end">
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {records.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-4 py-2 border-b bg-muted/30 text-sm font-semibold">
              {records.length} supplier records found
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">S.No</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Product</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Reason/Supplier</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Store</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-orange-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, idx) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2">{idx + 1}.</td>
                      <td className="px-3 py-2 font-medium">{r.product_name}</td>
                      <td className="px-3 py-2">{r.quantity}</td>
                      <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{r.transfer_reason || "—"}</td>
                      <td className="px-3 py-2">{r.to_store_name}</td>
                      <td className="px-3 py-2">{r.status}</td>
                      <td className="px-3 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditSupplier;
