import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, BookOpen, ShoppingCart, CheckCircle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ShortBookEntry = {
  id: string;
  product_name: string;
  quantity: number;
  transfer_reason: string | null;
  status: string;
  created_at: string;
  to_store_name?: string;
};

export default function ShortBook() {
  const [entries, setEntries] = useState<ShortBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      // Short book = items that were requested but stock was low/zero (pending transfers)
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setEntries((data || []).map((row: any) => ({
        ...row,
        to_store_name: row.to_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load short book");
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddEntry = async () => {
    if (!newItem.trim()) { toast.error("Product name required"); return; }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); return; }

      const stores = await (supabase as any).from("hms_ward_stores").select("id").limit(1).single();
      const storeId = stores.data?.id;

      await (supabase as any).from("hms_ward_stock_transfers").insert({
        from_store_id: storeId,
        to_store_id: storeId,
        product_name: newItem.trim(),
        quantity: parseInt(newQty) || 1,
        transfer_reason: "Short book: Out of stock at dispensing",
        status: "pending",
        requested_by: user.id,
      });

      toast.success("Added to short book");
      setNewItem("");
      setNewQty("");
      loadEntries();
    } catch (err: any) {
      toast.error("Failed to add");
    }
  };

  const pending = entries.filter(e => e.status === "pending");
  const inProgress = entries.filter(e => e.status === "approved" || e.status === "in_transit");
  const fulfilled = entries.filter(e => e.status === "received");

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-amber-600" /> Short-Book / Demand Register</h1>
          <p className="text-muted-foreground mt-1">Log demand when out-of-stock — auto-generates PO. Live from Supabase transfers.</p>
        </div>
      </div>

      {/* Add new entry */}
      <Card>
        <CardContent className="p-4 flex items-end gap-3">
          <div className="flex-1">
            <Input placeholder="Medicine name (out of stock)" value={newItem} onChange={e => setNewItem(e.target.value)} />
          </div>
          <Input className="w-20" type="number" placeholder="Qty" value={newQty} onChange={e => setNewQty(e.target.value)} />
          <Button onClick={handleAddEntry} className="bg-amber-600 hover:bg-amber-700">Add to Short Book</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{pending.length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><ShoppingCart className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">{inProgress.length}</p><p className="text-xs text-muted-foreground">Ordered</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{fulfilled.length}</p><p className="text-xs text-muted-foreground">Fulfilled</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{entries.length}</p><p className="text-xs text-muted-foreground">Total Entries</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Short Book Entries</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No short book entries</td></tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e.id} className={`border-b ${e.status === "pending" ? "bg-amber-50/30" : ""}`}>
                      <td className="px-3 py-2 text-xs font-medium">{e.product_name}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{e.quantity}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[150px] truncate">{e.transfer_reason || "—"}</td>
                      <td className="px-3 py-2 text-xs">{e.to_store_name}</td>
                      <td className="px-3 py-2 text-center"><Badge variant={e.status === "received" ? "outline" : e.status === "pending" ? "destructive" : "default"} className={`text-[10px] ${e.status === "received" ? "text-green-600" : ""}`}>{e.status}</Badge></td>
                      <td className="px-3 py-2 text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
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
            <p className="font-semibold text-xs text-purple-800">AI Short Book</p>
            <p className="text-[10px] text-purple-700">Each entry creates a transfer request in Supabase. Pending entries auto-convert to POs. Tracks patient demand even when stock is zero.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
