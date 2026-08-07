import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Brain, Truck, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TransferRecord = {
  id: string;
  product_name: string;
  quantity: number;
  batch_number: string | null;
  status: string;
  created_at: string;
  from_store_name?: string;
  to_store_name?: string;
};

const InterBranchTransfer = () => {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wardStores, setWardStores] = useState<{ id: string; ward_name: string }[]>([]);
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  useEffect(() => {
    loadWardStores();
    loadTransfers();
  }, []);

  const loadWardStores = async () => {
    const { data } = await (supabase as any)
      .from("hms_ward_stores")
      .select("id, ward_name")
      .eq("is_active", true);
    setWardStores(data || []);
    if (data && data.length >= 2) {
      setFromStore(data[0].id);
      setToStore(data[1].id);
    }
  };

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name), from_store:hms_ward_stores!hms_ward_stock_transfers_from_store_id_fkey(ward_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setTransfers((data || []).map((row: any) => ({
        ...row,
        to_store_name: row.to_store?.ward_name || "—",
        from_store_name: row.from_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load transfers");
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateTransfer = async () => {
    if (!fromStore || !toStore) { toast.error("Both stores are required"); return; }
    if (fromStore === toStore) { toast.error("Cannot transfer to same store"); return; }
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
          transfer_reason: "Inter-branch transfer",
          status: "in_transit",
          requested_by: user.id,
        });

      if (error) throw error;
      toast.success("Transfer created");
      setProductName("");
      setQuantity("");
      setBatchNumber("");
      loadTransfers();
    } catch (err: any) {
      toast.error("Failed to create transfer: " + (err.message || "Unknown error"));
      console.error(err);
    }
    setSaving(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === "received") return "text-green-600";
    if (status === "in_transit") return "text-blue-600";
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-blue-600" /> Inter-Branch Stock Transfer</h1>
          <p className="text-muted-foreground mt-1">Transfer stock between branches — AI detects shortages and suggests</p>
        </div>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Transfer Suggestion</p>
            <p className="text-sm text-purple-700">Based on stock levels, stores with low inventory can be replenished from stores with surplus. Review the transfer history below.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">New Transfer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={fromStore} onValueChange={setFromStore}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="From store" /></SelectTrigger>
              <SelectContent>
                {wardStores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <Select value={toStore} onValueChange={setToStore}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="To store" /></SelectTrigger>
              <SelectContent>
                {wardStores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.ward_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Product name" value={productName} onChange={(e) => setProductName(e.target.value)} />
            <Input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Input placeholder="Batch (optional)" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
          </div>
          <Button onClick={handleCreateTransfer} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Package className="h-4 w-4 mr-1" />}
            Create Transfer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Transfer History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">From</th>
                    <th className="px-3 py-2 text-left">To</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No transfers found</td></tr>
                  ) : (
                    transfers.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium text-xs">{t.product_name}</td>
                        <td className="px-3 py-2 text-xs">{t.from_store_name}</td>
                        <td className="px-3 py-2 text-xs">{t.to_store_name}</td>
                        <td className="px-3 py-2 text-center">{t.quantity}</td>
                        <td className="px-3 py-2 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant="outline" className={`text-[10px] ${getStatusBadge(t.status)}`}>{t.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterBranchTransfer;
