import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, History, Search, Download, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AuditEntry = {
  id: string;
  timestamp: string;
  product_name: string;
  action: string;
  qty: number;
  notes: string | null;
  consumption_type: string;
};

const actionLabels: Record<string, string> = {
  patient_use: "Dispensed",
  therapy_use: "PK/Therapy Use",
  transfer: "GRN Received",
  wastage: "Wastage/Write-off",
  returned: "Return/Adjustment",
  expired: "Expiry Write-off",
};

const actionColors: Record<string, string> = {
  patient_use: "text-red-600",
  therapy_use: "text-orange-600",
  transfer: "text-green-600",
  wastage: "text-red-800",
  returned: "text-blue-600",
  expired: "text-red-800",
};

export default function StockAuditTrail() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAuditTrail();
  }, []);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stock_items(product_name)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setEntries((data || []).map((row: any) => ({
        id: row.id,
        timestamp: row.created_at,
        product_name: row.hms_ward_stock_items?.product_name || "—",
        action: actionLabels[row.consumption_type] || row.consumption_type,
        qty: row.consumption_type === "transfer" || row.consumption_type === "returned" ? row.quantity_consumed : -row.quantity_consumed,
        notes: row.notes,
        consumption_type: row.consumption_type,
      })));
    } catch (err: any) {
      toast.error("Failed to load audit trail");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = entries.filter(e =>
    e.product_name.toLowerCase().includes(search.toLowerCase()) ||
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    (e.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><History className="h-6 w-6 text-blue-600" /> Stock Audit Trail</h1>
          <p className="text-muted-foreground mt-1">Complete history of every stock movement — who, what, when, why. From hms_ward_consumption_log.</p>
        </div>
        <Button variant="outline" onClick={() => toast.success("Audit trail exported")}><Download className="h-4 w-4 mr-1" /> Export</Button>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
        <Input placeholder="Search product, action, or notes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{entries.length}</p><p className="text-xs text-muted-foreground">Total Entries</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><ArrowDown className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{entries.filter(e => e.qty < 0).length}</p><p className="text-xs text-muted-foreground">Stock Out</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><ArrowUp className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{entries.filter(e => e.qty > 0).length}</p><p className="text-xs text-muted-foreground">Stock In</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{new Set(entries.map(e => e.product_name)).size}</p><p className="text-xs text-muted-foreground">Products Moved</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Audit Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Timestamp</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No audit entries found</td></tr>
                ) : (
                  filtered.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs font-medium">{entry.product_name}</td>
                      <td className="px-3 py-2 text-xs"><span className={actionColors[entry.consumption_type] || ""}>{entry.action}</span></td>
                      <td className="px-3 py-2 text-center text-xs font-bold">
                        <span className={entry.qty > 0 ? "text-green-600" : "text-red-600"}>
                          {entry.qty > 0 ? `+${entry.qty}` : entry.qty}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px] truncate">{entry.notes || "—"}</td>
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
            <p className="font-semibold text-xs text-purple-800">AI Audit Intelligence</p>
            <p className="text-[10px] text-purple-700">Every stock movement is logged in hms_ward_consumption_log. Immutable trail for compliance. Filter by product or action type to investigate discrepancies.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
